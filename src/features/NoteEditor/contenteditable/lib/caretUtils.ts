export function getSelectionOffsets(root: HTMLElement): { start: number; end: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);

  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return null;
  }

  const startRange = range.cloneRange();
  startRange.selectNodeContents(root);
  startRange.setEnd(range.startContainer, range.startOffset);

  const endRange = range.cloneRange();
  endRange.selectNodeContents(root);
  endRange.setEnd(range.endContainer, range.endOffset);

  return {
    start: startRange.toString().length,
    end: endRange.toString().length,
  };
}

export function findTextPosition(root: HTMLElement, offset: number): { node: Node; offset: number } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  let rest = offset;
  let lastTextNode: Node | null = null;

  while (current) {
    const len = current.textContent?.length ?? 0;
    lastTextNode = current;

    if (rest <= len) {
      return { node: current, offset: rest };
    }

    rest -= len;
    current = walker.nextNode();
  }

  if (lastTextNode) {
    return {
      node: lastTextNode,
      offset: lastTextNode.textContent?.length ?? 0,
    };
  }

  return { node: root, offset: 0 };
}

export function setSelectionOffsets(root: HTMLElement, start: number, end: number = start) {
  const selection = window.getSelection();
  if (!selection) return;

  const startPos = findTextPosition(root, start);
  const endPos = findTextPosition(root, end);

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);

  selection.removeAllRanges();
  selection.addRange(range);
}