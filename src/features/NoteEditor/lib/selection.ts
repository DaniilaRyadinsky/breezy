import { getBlockContentElement } from "./segmentsUtils";

export type CaretSelection = {
  start: number;
  end: number;
};

export type EditorPoint = {
  blockId: string;
  offset: number;
};

export type EditorSelection = {
  start: EditorPoint;
  end: EditorPoint;
};

export type PendingEditorSelection = EditorSelection;

export type SingleBlockSelection = CaretSelection & {
  blockId: string;
  blockEl: HTMLElement;
};

export function getSelectionOffsets(
  root: HTMLElement
): { start: number; end: number } | null {
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

export function findTextPosition(
  root: HTMLElement,
  offset: number
): { node: Node; offset: number } {
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

function getClosestBlockElement(node: Node | null): HTMLElement | null {
  if (!node) return null;

  const el =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;

  return el?.closest("[data-block-id]") ?? null;
}

function getOffsetWithinBlock(
  blockEl: HTMLElement,
  targetNode: Node,
  targetOffset: number
): number {
  const range = document.createRange();
  range.selectNodeContents(blockEl);
  range.setEnd(targetNode, targetOffset);
  return range.toString().length;
}

export function getBlockElement(
  editorRoot: HTMLElement,
  blockId: string
): HTMLElement | null {
  const selector = `[data-block-id="${CSS.escape(blockId)}"]`;
  return editorRoot.querySelector<HTMLElement>(selector);
}

export function getEditorSelection(
  editorRoot: HTMLElement
): EditorSelection | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);

  if (
    !editorRoot.contains(range.startContainer) ||
    !editorRoot.contains(range.endContainer)
  ) {
    return null;
  }

  const startBlock = getClosestBlockElement(range.startContainer);
  const endBlock = getClosestBlockElement(range.endContainer);

  if (!startBlock || !endBlock) return null;

  const startBlockId = startBlock.dataset.blockId;
  const endBlockId = endBlock.dataset.blockId;

  if (!startBlockId || !endBlockId) return null;

  const startContent = getBlockContentElement(startBlock);
  const endContent = getBlockContentElement(endBlock);

  return {
    start: {
      blockId: startBlockId,
      offset: getOffsetWithinBlock(
        startContent,
        range.startContainer,
        range.startOffset
      ),
    },
    end: {
      blockId: endBlockId,
      offset: getOffsetWithinBlock(
        endContent,
        range.endContainer,
        range.endOffset
      ),
    },
  };
}

export function normalizeEditorSelection(
  selection: EditorSelection,
  blockOrder: string[]
): EditorSelection {
  const startIndex = blockOrder.indexOf(selection.start.blockId);
  const endIndex = blockOrder.indexOf(selection.end.blockId);

  if (startIndex < endIndex) return selection;

  if (startIndex > endIndex) {
    return {
      start: selection.end,
      end: selection.start,
    };
  }

  if (selection.start.offset <= selection.end.offset) return selection;

  return {
    start: selection.end,
    end: selection.start,
  };
}

export function isCollapsedEditorSelection(selection: EditorSelection): boolean {
  return (
    selection.start.blockId === selection.end.blockId &&
    selection.start.offset === selection.end.offset
  );
}

export function getSingleBlockSelection(
  editorRoot: HTMLElement
): SingleBlockSelection | null {
  const selection = getEditorSelection(editorRoot);
  if (!selection) return null;

  if (selection.start.blockId !== selection.end.blockId) {
    return null;
  }

  const blockEl = getBlockElement(editorRoot, selection.start.blockId);
  if (!blockEl) return null;

  return {
    blockId: selection.start.blockId,
    blockEl,
    start: selection.start.offset,
    end: selection.end.offset,
  };
}

export function setEditorSelection(
  editorRoot: HTMLElement,
  selection: EditorSelection
) {
  const startBlock = getBlockElement(editorRoot, selection.start.blockId);
  const endBlock = getBlockElement(editorRoot, selection.end.blockId);

  if (!startBlock || !endBlock) return;

  const startContent = getBlockContentElement(startBlock);
  const endContent = getBlockContentElement(endBlock);

  const startPos = findTextPosition(startContent, selection.start.offset);
  const endPos = findTextPosition(endContent, selection.end.offset);

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);

  const sel = window.getSelection();
  if (!sel) return;

  sel.removeAllRanges();
  sel.addRange(range);
}

export function setSelectionInBlock(
  editorRoot: HTMLElement,
  blockId: string,
  start: number,
  end: number = start
) {
  setEditorSelection(editorRoot, {
    start: { blockId, offset: start },
    end: { blockId, offset: end },
  });
}