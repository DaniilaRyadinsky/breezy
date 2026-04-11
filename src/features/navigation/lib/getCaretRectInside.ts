export function getCaretRectInside(root: HTMLElement): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;

  const range = sel.getRangeAt(0).cloneRange();
  if (!root.contains(range.startContainer)) return null;

  range.collapse(true);

  const rects = range.getClientRects();
  if (rects.length > 0) {
    return rects[0];
  }

  const rect = range.getBoundingClientRect();
  if (rect.width !== 0 || rect.height !== 0) {
    return rect;
  }

  return null;
}