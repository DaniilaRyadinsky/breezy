import { EditorSelection, getEditorSelection, setEditorSelection } from "@/features/NoteEditor/lib/editorSelection";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type SelectionMenuPosition = {
  top: number;
  left: number;
} | null;

type UseSelectionMenuOptions<TBlockType extends string = string> = {
  verticalOffset?: number;
  getBlockTypeById?: (blockId: string) => TBlockType | null | undefined;
};

type UseSelectionMenuResult<TBlockType extends string = string> = {
  menuPosition: SelectionMenuPosition;
  isOpen: boolean;
  savedSelection: EditorSelection | null;
  currentBlockId: string | null;
  currentBlockType: TBlockType | null;
  openFromCurrentSelection: () => void;
  closeMenu: () => void;
  restoreSelection: () => boolean;
};

export const useSelectionMenu = <TBlockType extends string = string>(
  editorRef: RefObject<HTMLElement | null>,
  options: UseSelectionMenuOptions<TBlockType> = {}
): UseSelectionMenuResult<TBlockType> => {
  const { verticalOffset = 16, getBlockTypeById } = options;

  const [menuPosition, setMenuPosition] = useState<SelectionMenuPosition>(null);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [currentBlockType, setCurrentBlockType] = useState<TBlockType | null>(null);

  const savedSelectionRef = useRef<EditorSelection | null>(null);
  const rafRef = useRef<number | null>(null);

  const isPointerSelectingRef = useRef(false);
  const isKeyboardSelectingRef = useRef(false);

  const closeMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  const restoreSelection = useCallback(() => {
    const root = editorRef.current;
    const savedSelection = savedSelectionRef.current;

    if (!root || !savedSelection) return false;

    root.focus({ preventScroll: true });
    setEditorSelection(root, savedSelection);

    return true;
  }, [editorRef]);

  const resetCurrentBlock = useCallback(() => {
    setCurrentBlockId(null);
    setCurrentBlockType(null);
  }, []);

  const getClosestBlockElement = useCallback(
    (node: Node | null): HTMLElement | null => {
      const root = editorRef.current;
      if (!node || !root) return null;

      const element =
        node.nodeType === Node.ELEMENT_NODE
          ? (node as HTMLElement)
          : node.parentElement;

      if (!element) return null;

      const blockEl = element.closest("[data-block-id]") as HTMLElement | null;

      if (!blockEl || !root.contains(blockEl)) {
        return null;
      }

      return blockEl;
    },
    [editorRef]
  );

  const updateCurrentBlockFromRange = useCallback(
    (range: Range) => {
      const blockEl = getClosestBlockElement(range.startContainer);
      const blockId = blockEl?.dataset.blockId ?? null;

      setCurrentBlockId(blockId);

      if (!blockId || !getBlockTypeById) {
        setCurrentBlockType(null);
        return;
      }

      const blockType = getBlockTypeById(blockId) ?? null;
      setCurrentBlockType(blockType);
    },
    [getClosestBlockElement, getBlockTypeById]
  );

  const getAnchorRect = useCallback((range: Range): DOMRect | null => {
    const rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 0 || rect.height > 0
    );

    if (rects.length > 0) {
      rects.sort((a, b) => {
        if (a.top !== b.top) return a.top - b.top;
        return a.left - b.left;
      });

      return rects[0];
    }

    const rect = range.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      return rect;
    }

    return null;
  }, []);

  const openFromCurrentSelection = useCallback(() => {
    const root = editorRef.current;
    if (!root) {
      setMenuPosition(null);
      resetCurrentBlock();
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0 || domSelection.isCollapsed) {
      setMenuPosition(null);
      resetCurrentBlock();
      return;
    }

    const range = domSelection.getRangeAt(0);

    if (
      !root.contains(range.startContainer) ||
      !root.contains(range.endContainer)
    ) {
      setMenuPosition(null);
      resetCurrentBlock();
      return;
    }

    const editorSelection = getEditorSelection(root);
    if (!editorSelection) {
      setMenuPosition(null);
      resetCurrentBlock();
      return;
    }

    const rect = getAnchorRect(range);
    if (!rect) {
      setMenuPosition(null);
      resetCurrentBlock();
      return;
    }

    savedSelectionRef.current = editorSelection;
    updateCurrentBlockFromRange(range);

    setMenuPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - verticalOffset,
    });
  }, [
    editorRef,
    getAnchorRect,
    resetCurrentBlock,
    updateCurrentBlockFromRange,
    verticalOffset,
  ]);

  const scheduleOpenCheck = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      openFromCurrentSelection();
    });
  }, [openFromCurrentSelection]);

  useEffect(() => {
    const isInsideEditor = (node: Node | null) => {
      const root = editorRef.current;
      return !!root && !!node && root.contains(node);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!isInsideEditor(e.target as Node)) return;

      isPointerSelectingRef.current = true;
      setMenuPosition(null);
    };

    const handlePointerUp = () => {
      if (!isPointerSelectingRef.current) return;

      isPointerSelectingRef.current = false;
      scheduleOpenCheck();
    };

    const handleSelectionChange = () => {
      const root = editorRef.current;
      const selection = window.getSelection();

      if (!root || !selection || selection.rangeCount === 0) {
        setMenuPosition(null);
        resetCurrentBlock();
        return;
      }

      if (selection.isCollapsed) {
        setMenuPosition(null);
        resetCurrentBlock();
        return;
      }

      const range = selection.getRangeAt(0);

      if (
        !root.contains(range.startContainer) ||
        !root.contains(range.endContainer)
      ) {
        setMenuPosition(null);
        resetCurrentBlock();
        return;
      }

      updateCurrentBlockFromRange(range);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const root = editorRef.current;
      if (!root) return;

      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode ?? null;
      const focusNode = selection?.focusNode ?? null;

      const isEditorContext =
        isInsideEditor(anchorNode) || isInsideEditor(focusNode);

      if (!isEditorContext) return;

      if (
        e.key.length === 1 ||
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "Enter"
      ) {
        setMenuPosition(null);
      }

      const isSelectionByKeyboard =
        (e.shiftKey &&
          [
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
            "PageUp",
            "PageDown",
          ].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a");

      if (isSelectionByKeyboard) {
        isKeyboardSelectingRef.current = true;
        setMenuPosition(null);
      }
    };

    const handleKeyUp = () => {
      if (!isKeyboardSelectingRef.current) return;

      isKeyboardSelectingRef.current = false;
      scheduleOpenCheck();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [editorRef, resetCurrentBlock, scheduleOpenCheck, updateCurrentBlockFromRange]);

  return {
    menuPosition,
    isOpen: Boolean(menuPosition),
    savedSelection: savedSelectionRef.current,
    currentBlockId,
    currentBlockType,
    openFromCurrentSelection,
    closeMenu,
    restoreSelection,
  };
};