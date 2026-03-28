// contexts/BlocksRegistryContext.ts
import { createContext, useContext, useRef, ReactNode, useCallback, useMemo } from 'react';
import { setCaretToEdge } from '../lib';

interface BlocksRegistry {
  blocksMap: Map<string, HTMLElement>;
  registerBlock: (id: string, element: HTMLElement) => void;
  unregisterBlock: (id: string) => void;
  focusBlock: (id: string, edge?: 'start' | 'end') => void;
  focusBlockAtCoordinate: (id: string, x: number, direction: 'up' | 'down') => void;
}

const BlocksRegistryContext = createContext<BlocksRegistry | null>(null);

export const BlocksRegistryProvider = ({ children }: { children: ReactNode }) => {
  const blocksMap = useRef(new Map<string, HTMLElement>());
  const pendingFocusRef = useRef<{ id: string; edge: 'start' | 'end' } | null>(null);

  const registerBlock = useCallback((id: string, element: HTMLElement) => {
    blocksMap.current.set(id, element);

    const pending = pendingFocusRef.current;
    if (pending && pending.id === id) {
      element.focus();
      setCaretToEdge(element, pending.edge);
      pendingFocusRef.current = null;
    }
  }, []);

  const unregisterBlock = useCallback((id: string) => {
    blocksMap.current.delete(id);
  }, []);

  const focusBlock = useCallback((id: string, edge: 'start' | 'end' = 'end') => {
    const element = blocksMap.current.get(id);

    if (element) {
      element.focus();
      setCaretToEdge(element, edge);
      return;
    }

    pendingFocusRef.current = { id, edge };
  }, []);

  const focusBlockAtCoordinate = useCallback(
    (id: string, x: number, direction: 'up' | 'down') => {
      const element = blocksMap.current.get(id);
      if (!element) return;

      element.focus();

      const rect = element.getBoundingClientRect();
      const targetY = direction === 'down' ? rect.top + 17 : rect.bottom - 17;

      const applyRange = (range: Range | null) => {
        if (!range) return false;

        const startNode = range.startContainer;
        const isEmpty = !(element.textContent ?? '').trim();

        if (!element.contains(startNode)) return false;
        if (isEmpty && startNode === element) return false;

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

      setCaretToEdge(element, direction === 'down' ? 'start' : 'end');
    },
    []
  );

  const value = useMemo(
    () => ({
      blocksMap: blocksMap.current,
      registerBlock,
      unregisterBlock,
      focusBlock,
      focusBlockAtCoordinate,
    }),
    [registerBlock, unregisterBlock, focusBlock, focusBlockAtCoordinate]
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
    throw new Error('useBlocksRegistry must be used within provider');
  }
  return context;
};