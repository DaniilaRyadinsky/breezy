const getCaretContainer = (element: HTMLElement): HTMLElement => {
  return element.querySelector<HTMLElement>("[data-block-content]") ?? element;
};

const isInsideNonEditable = (node: Node, root: HTMLElement) => {
  const parent =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;

  if (!parent) return false;

  const nonEditableAncestor = parent.closest('[contenteditable="false"]');
  return !!nonEditableAncestor && root.contains(nonEditableAncestor);
};

export const setCaretToEdge = (
  element: HTMLElement,
  edge: "start" | "end"
) => {
  const sel = window.getSelection();
  if (!sel) return;

  const range = document.createRange();
  const caretContainer = getCaretContainer(element);

  const walker = document.createTreeWalker(
    caretContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (isInsideNonEditable(node, caretContainer)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let firstTextNode: Text | null = null;
  let lastTextNode: Text | null = null;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!firstTextNode) firstTextNode = node;
    lastTextNode = node;
  }

  if (firstTextNode && lastTextNode) {
    const targetNode = edge === "start" ? firstTextNode : lastTextNode;
    const offset = edge === "start" ? 0 : targetNode.textContent?.length ?? 0;
    range.setStart(targetNode, offset);
  } else {
    const offset = edge === "start" ? 0 : caretContainer.childNodes.length;
    range.setStart(caretContainer, offset);
  }

  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};