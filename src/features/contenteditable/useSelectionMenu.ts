import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  EditorSelection,
  getEditorSelection,
  setEditorSelection,
} from "./lib/editorSelection";

type SelectionMenuPosition = {
  top: number;
  left: number;
} | null;

type UseSelectionMenuResult = {
  menuPosition: SelectionMenuPosition;
  isOpen: boolean;
  savedSelection: EditorSelection | null;
  openFromCurrentSelection: () => void;
  closeMenu: () => void;
  restoreSelection: () => boolean;
};

type UseSelectionMenuOptions = {
  verticalOffset?: number;
};

export const useSelectionMenu = (
  editorRef: RefObject<HTMLElement | null>,
  options: UseSelectionMenuOptions = {}
): UseSelectionMenuResult => {
  const { verticalOffset = 8 } = options;

  const [menuPosition, setMenuPosition] = useState<SelectionMenuPosition>(null);
  const savedSelectionRef = useRef<EditorSelection | null>(null);

  const closeMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  const restoreSelection = useCallback(() => {
    const root = editorRef.current;
    const savedSelection = savedSelectionRef.current;

    if (!root || !savedSelection) return false;

    setEditorSelection(root, savedSelection);
    return true;
  }, [editorRef]);

  const openFromCurrentSelection = useCallback(() => {
    const root = editorRef.current;
    if (!root) {
      setMenuPosition(null);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0 || domSelection.isCollapsed) {
      setMenuPosition(null);
      return;
    }

    const range = domSelection.getRangeAt(0);

    if (
      !root.contains(range.startContainer) ||
      !root.contains(range.endContainer)
    ) {
      setMenuPosition(null);
      return;
    }

    const editorSelection = getEditorSelection(root);
    if (!editorSelection) {
      setMenuPosition(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      setMenuPosition(null);
      return;
    }

    savedSelectionRef.current = editorSelection;

    setMenuPosition({
      left: rect.left + rect.width / 2,
      top: rect.top - verticalOffset,
    });
  }, [editorRef, verticalOffset]);

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const scheduleOpenCheck = () => {
      requestAnimationFrame(() => {
        openFromCurrentSelection();
      });
    };

    const handleMouseUp = () => {
      scheduleOpenCheck();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key.startsWith("Arrow") ||
        e.key === "Shift" ||
        (e.ctrlKey || e.metaKey)
      ) {
        scheduleOpenCheck();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && root.contains(target)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setMenuPosition(null);
        }
      }
    };

    root.addEventListener("mouseup", handleMouseUp);
    root.addEventListener("keyup", handleKeyUp);
    root.addEventListener("mousedown", handleMouseDown);

    return () => {
      root.removeEventListener("mouseup", handleMouseUp);
      root.removeEventListener("keyup", handleKeyUp);
      root.removeEventListener("mousedown", handleMouseDown);
    };
  }, [editorRef, openFromCurrentSelection]);

  return {
    menuPosition,
    isOpen: Boolean(menuPosition),
    savedSelection: savedSelectionRef.current,
    openFromCurrentSelection,
    closeMenu,
    restoreSelection,
  };
};