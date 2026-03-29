import { useCallback } from 'react';
import { getEditableStartX, getCaretRectInside } from './lib';
import { calculateTarget } from './lib/handleNavigate';
import { useBlocksRegistry } from './model/BlocksRegistryContext';
import { BLOCK_NAVIGATION_EDGE_OFFSET } from './consts';

export const useBlockNavigation = (
  editableRef: React.RefObject<HTMLElement | null>,
  id: string,
) => {
  const { focusBlockAtCoordinate } = useBlocksRegistry();

  const onArrowKeyDown = useCallback((
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
  }, [editableRef, focusBlockAtCoordinate, id]);

  return { onArrowKeyDown };
};