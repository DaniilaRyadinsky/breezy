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