import { useCallback } from 'react';
import { getEditableStartX, getCaretRectInside, getCaretOffsetInElement } from './lib';
import { calculateTarget } from './lib/handleNavigate';
import { useBlocksRegistry } from './model/BlocksRegistryContext';
import { BLOCK_NAVIGATION_EDGE_OFFSET } from './consts';
import { getCaretOffsetInElementToEnd } from './lib/getCaretOffsetInElement';

export const useBlockNavigation = (
  editableRef: React.RefObject<HTMLElement | null>,
  id: string,
) => {
  const { focusBlockAtCoordinate, focusBlock } = useBlocksRegistry();

  const handleHorizontalArrow = useCallback((
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    const el = editableRef.current;
    if (!el) return;

    const isEmpty = !(el.textContent ?? '').trim();

    if (isEmpty) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const target = calculateTarget(id, e.key === 'ArrowLeft' ? 'up' : 'down');

        if (!target) return;

        focusBlock(target, e.key === 'ArrowLeft' ? 'end' : 'start');
        return;
      }
      return;
    }

    const caretOffset = getCaretOffsetInElement(el);
    const caretOffsetToEnd = getCaretOffsetInElementToEnd(el);

    if (caretOffset === null || caretOffsetToEnd === null) return;

    const isAtStart = caretOffset === 0;
    const isAtEnd = caretOffsetToEnd === 0;

    if (e.key === 'ArrowLeft' && isAtStart) {
      e.preventDefault();
      const target = calculateTarget(id, 'up');

      if (!target) return;

      focusBlock(target, 'end');
      return;
    }

    if (e.key === 'ArrowRight' && isAtEnd) {
      e.preventDefault();
      const target = calculateTarget(id, 'down');

      if (!target) return;

      focusBlock(target, 'start');
    }
  }, [id, calculateTarget, focusBlock]);


  const handleVerticalArrow = useCallback((
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    const el = editableRef.current;
    if (!el) return;

    const isEmpty = !(el.textContent ?? '').trim();

    if (isEmpty) {
      e.preventDefault();

      const direction = e.key === 'ArrowUp' ? 'up' : 'down';
      const target = calculateTarget(id, direction);

      if (!target) return;

      focusBlockAtCoordinate(target, getEditableStartX(el), direction);
      return;
    }

    const caretRect = getCaretRectInside(el);
    if (!caretRect) return;

    const blockRect = el.getBoundingClientRect();

    const shouldNavigate =
      e.key === 'ArrowUp'
        ? caretRect.top <= blockRect.top + BLOCK_NAVIGATION_EDGE_OFFSET
        : caretRect.bottom >= blockRect.bottom - BLOCK_NAVIGATION_EDGE_OFFSET;

    if (!shouldNavigate) return;

    e.preventDefault();

    const direction = e.key === 'ArrowUp' ? 'up' : 'down';
    const target = calculateTarget(id, direction);

    if (!target) return;

    focusBlockAtCoordinate(target, caretRect.left, direction);
  }, [id, calculateTarget, focusBlockAtCoordinate]);


  return { handleHorizontalArrow, handleVerticalArrow };
};