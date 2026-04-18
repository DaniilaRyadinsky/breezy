import {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { setCaretToEdge } from "../lib/setCaretToEdge";
import { BLOCK_NAVIGATION_EDGE_OFFSET } from "../consts";

interface PendingFocus {
  id: string;
  edge: "start" | "end";
}

interface BlocksRegistry {
  registerBlock: (id: string, element: HTMLElement) => void;
  unregisterBlock: (id: string) => void;
  registerEditorRoot: (element: HTMLElement | null) => void;
  getBlockElement: (id: string) => HTMLElement | null;
  focusBlock: (id: string, edge?: "start" | "end") => void;
  focusBlockAtCoordinate: (
    id: string,
    x: number,
    direction: "up" | "down"
  ) => void;
}

const BlocksRegistryContext = createContext<BlocksRegistry | null>(null);

export const BlocksRegistryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const blocksMap = useRef(new Map<string, HTMLElement>());
  const editorRootRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef<PendingFocus | null>(null);

  const registerEditorRoot = useCallback((element: HTMLElement | null) => {
    editorRootRef.current = element;

    const pending = pendingFocusRef.current;
    if (!element || !pending) return;

    const blockEl = blocksMap.current.get(pending.id);
    if (!blockEl) return;

    element.focus();
    setCaretToEdge(blockEl, pending.edge);
    pendingFocusRef.current = null;
  }, []);

  const registerBlock = useCallback((id: string, element: HTMLElement) => {
    blocksMap.current.set(id, element);

    const pending = pendingFocusRef.current;
    const editorRoot = editorRootRef.current;

    if (pending && pending.id === id && editorRoot) {
      editorRoot.focus();
      setCaretToEdge(element, pending.edge);
      pendingFocusRef.current = null;
    }
  }, []);

  const unregisterBlock = useCallback((id: string) => {
    blocksMap.current.delete(id);
  }, []);

  const getBlockElement = useCallback((id: string) => {
    return blocksMap.current.get(id) ?? null;
  }, []);

  const focusBlock = useCallback((id: string, edge: "start" | "end" = "end") => {
    const blockEl = blocksMap.current.get(id);
    const editorRoot = editorRootRef.current;

    if (blockEl && editorRoot) {
      editorRoot.focus();
      setCaretToEdge(blockEl, edge);
      return;
    }

    pendingFocusRef.current = { id, edge };
  }, []);

  const focusBlockAtCoordinate = useCallback(
    (id: string, x: number, direction: "up" | "down") => {
      const blockEl = blocksMap.current.get(id);
      const editorRoot = editorRootRef.current;

      if (!blockEl || !editorRoot) return;

      editorRoot.focus();

      const rect = blockEl.getBoundingClientRect();
      const targetY =
        direction === "down"
          ? rect.top + BLOCK_NAVIGATION_EDGE_OFFSET
          : rect.bottom - BLOCK_NAVIGATION_EDGE_OFFSET;

      const applyRange = (range: Range | null) => {
        if (!range) return false;

        const startNode = range.startContainer;
        const isEmpty = !(blockEl.textContent ?? "").trim();

        if (!blockEl.contains(startNode)) return false;
        if (isEmpty && startNode === blockEl) return false;

        const sel = window.getSelection();
        if (!sel) return false;

        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      };

      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, targetY);
        if (applyRange(range)) return;
      }

      const doc = document as Document & {
        caretPositionFromPoint?: (
          x: number,
          y: number
        ) => { offsetNode: Node; offset: number } | null;
      };

      if (doc.caretPositionFromPoint) {
        const pos = doc.caretPositionFromPoint(x, targetY);
        if (pos) {
          const range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);

          if (applyRange(range)) return;
        }
      }

      setCaretToEdge(blockEl, direction === "down" ? "start" : "end");
    },
    []
  );

  const value = useMemo(
    () => ({
      registerBlock,
      unregisterBlock,
      registerEditorRoot,
      getBlockElement,
      focusBlock,
      focusBlockAtCoordinate,
    }),
    [
      registerBlock,
      unregisterBlock,
      registerEditorRoot,
      getBlockElement,
      focusBlock,
      focusBlockAtCoordinate,
    ]
  );

  return (
    <BlocksRegistryContext.Provider value={value}>
      {children}
    </BlocksRegistryContext.Provider>
  );
};

export const useBlocksRegistry = () => {
  const context = useContext(BlocksRegistryContext);
  if (!context) {
    throw new Error("useBlocksRegistry must be used within provider");
  }
  return context;
};