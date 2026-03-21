// contexts/BlocksRegistryContext.ts
import { createContext, useContext, useRef, ReactNode, useCallback } from 'react';
import { setCaretToEdge } from '../lib';

interface BlocksRegistry {
  // Сама мапа: ID блока -> ссылка на DOM элемент
  blocksMap: Map<string, HTMLDivElement>;
  // Метод для регистрации блока (вызывается при монтировании)
  registerBlock: (id: string, element: HTMLDivElement) => void;
  // Метод для удаления из реестра (при размонтировании)
  unregisterBlock: (id: string) => void;
  // Метод для установки фокуса
  focusBlock: (id: string, edge?: 'start' | 'end') => void;
  focusBlockAtCoordinate: (id: string, x: number, direction: 'up' | 'down') => void;
}

const BlocksRegistryContext = createContext<BlocksRegistry | null>(null);

export const BlocksRegistryProvider = ({ children }: { children: ReactNode }) => {
  const blocksMap = useRef(new Map<string, HTMLDivElement>());

  const registerBlock = (id: string, element: HTMLDivElement) => {
    blocksMap.current.set(id, element);
  };

  const unregisterBlock = (id: string) => {
    blocksMap.current.delete(id);
  };

  const focusBlock = (id: string, edge: 'start' | 'end' = 'end') => {
    const element = blocksMap.current.get(id);
    if (!element) return;

    element.focus();
    setCaretToEdge(element, edge);
  };


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

      // На пустом блоке range на самом контейнере часто "ложно валиден"
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

  return (
    <BlocksRegistryContext.Provider value={
      {
        blocksMap: blocksMap.current,
        registerBlock,
        unregisterBlock,
        focusBlock,
        focusBlockAtCoordinate,

      }}>
      {children}
    </BlocksRegistryContext.Provider>
  );
};

export const useBlocksRegistry = () => {
  const context = useContext(BlocksRegistryContext);
  if (!context) throw new Error('useBlocksRegistry must be used within provider');
  return context;
};