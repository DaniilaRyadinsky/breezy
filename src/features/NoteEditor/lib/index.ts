export function getCaretOffsetInElement(element: HTMLElement): number | null {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)

  if (!range.collapsed) {
    return null
  }

  if (!element.contains(range.startContainer)) {
    return null
  }

  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(element)
  preCaretRange.setEnd(range.startContainer, range.startOffset)

  return preCaretRange.toString().length
}

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

export function getEditableStartX(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const paddingLeft = parseFloat(styles.paddingLeft || "0");

  return rect.left + paddingLeft + 1;
}

export const setCaretToEdge = (element: HTMLElement, edge: 'start' | 'end') => {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let firstTextNode: Text | null = null;
  let lastTextNode: Text | null = null;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!firstTextNode) firstTextNode = node;
    lastTextNode = node;
  }

  if (firstTextNode && lastTextNode) {
    const targetNode = edge === 'start' ? firstTextNode : lastTextNode;
    const offset = edge === 'start' ? 0 : targetNode.textContent?.length ?? 0;
    range.setStart(targetNode, offset);
  } else {
    // Если текстовых узлов нет, ставим каретку в сам editable-контейнер
    // в начало или конец дочерних узлов
    const offset = edge === 'start' ? 0 : element.childNodes.length;
    range.setStart(element, offset);
  }

  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};