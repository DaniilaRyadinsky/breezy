import { RefObject, useCallback, useState } from "react";

type SlashMenuState = {
  anchorEl: HTMLElement | null;
  blockId: string | null;
};

export const useSlashMenu = (editorRef: RefObject<HTMLElement | null>) => {
  const [state, setState] = useState<SlashMenuState>({
    anchorEl: null,
    blockId: null,
  });

  const closeSlashMenu = useCallback(() => {
    setState({
      anchorEl: null,
      blockId: null,
    });
  }, []);

  const handleBeforeInputCapture = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      const nativeEvent = e.nativeEvent as InputEvent;

      if (nativeEvent.inputType !== "insertText") return;
      if (nativeEvent.data !== "/") return;

      const selection = window.getSelection();
      if (!selection || !selection.isCollapsed) return;

      const node = selection.anchorNode;
      if (!node) return;

      const element =
        node.nodeType === Node.TEXT_NODE
          ? node.parentElement
          : (node as HTMLElement);

      const blockEl = element?.closest<HTMLElement>("[data-block-id]");
      if (!blockEl) return;

      const editorEl = editorRef.current;
      if (!editorEl?.contains(blockEl)) return;

      const text = blockEl.textContent ?? "";

      if (text.trim() !== "") return;

      e.preventDefault();
      nativeEvent.preventDefault();

      setState({
        anchorEl: blockEl,
        blockId: blockEl.dataset.blockId ?? null,
      });
    },
    [editorRef]
  );

  return {
    isSlashMenuOpen: Boolean(state.anchorEl && state.blockId),
    slashMenuAnchorEl: state.anchorEl,
    slashMenuBlockId: state.blockId,
    closeSlashMenu,
    handleBeforeInputCapture,
  };
};