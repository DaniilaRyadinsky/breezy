import { TextStyle } from "@/entities/note/model/blockTypes";
import { BlockOperation } from "@/entities/note/model/operationsType";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { RefObject, useRef, useCallback, useLayoutEffect, useEffect, useState } from "react";
import { PendingEditorSelection, EditorSelection, getBlockElement, isCollapsedEditorSelection } from "../lib/selection";
import { getEditableTextContext } from "../lib/getEditableTextContext";
import { buildDeleteSelectionOperations } from "../lib/documentRichText";
import { setEditorSelection } from "../lib/selection";
import { blockBehaviors } from "../model/behaviors/registry";
import { ActiveNote } from "@/entities/note/model/noteTypes";
import { richTextBaseBehavior } from "../model/behaviors/behaviors";
import { getBlockPlainText } from "../lib/plainText";

type ApplyDocumentOperations = (
  noteId: string,
  operations: BlockOperation[]
) => void;

type SlashMenuState = {
  anchorEl: HTMLElement | null;
  blockId: string | null;
};

type UseDocumentEditorResult = {
  applyStyleToSelection: (style: TextStyle) => void;

  isSlashMenuOpen: boolean;
  slashMenuAnchorEl: HTMLElement | null;
  slashMenuBlockId: string | null;
  closeSlashMenu: () => void;
};

export const useDocumentEditor = (
  editorRef: RefObject<HTMLElement | null>,
  onOperations: ApplyDocumentOperations
): UseDocumentEditorResult => {
  const activeNote = useActiveNoteStore((state) => state.activeNote);

  const pendingSelectionRef = useRef<PendingEditorSelection | null>(null);

  const [slashMenu, setSlashMenu] = useState<SlashMenuState>({
    anchorEl: null,
    blockId: null,
  });

  const closeSlashMenu = useCallback(() => {
    setSlashMenu({
      anchorEl: null,
      blockId: null,
    });
  }, []);

  const commitOperations = useCallback(
    (
      operations: BlockOperation[],
      nextSelection: PendingEditorSelection
    ) => {
      const noteId = useActiveNoteStore.getState().activeNote?.id;

      if (!noteId || operations.length === 0) return;

      pendingSelectionRef.current = nextSelection;
      onOperations(noteId, operations);
    },
    [onOperations]
  );

  const deleteSelection = useCallback(
    (note: ActiveNote, selection: EditorSelection) => {
      const result = buildDeleteSelectionOperations({
        noteId: note.id,
        note,
        selection,
      });

      if (!result || result.operations.length === 0) {
        return false;
      }

      commitOperations(result.operations, result.nextSelection);
      return true;
    },
    [commitOperations]
  );

  useLayoutEffect(() => {
    const root = editorRef.current;
    const pending = pendingSelectionRef.current;

    if (!root || !pending) return;

    setEditorSelection(root, pending);
    pendingSelectionRef.current = null;
  }, [editorRef, activeNote]);

  const applyStyleToSelection = useCallback(
    (style: TextStyle) => {
      const root = editorRef.current;
      if (!root) return;

      const ctx = getEditableTextContext(root);
      if (!ctx) return;

      if (!richTextBaseBehavior.applyStyleToSelection) return;

      richTextBaseBehavior.applyStyleToSelection({
        note: ctx.note,
        block: ctx.block as never,
        selection: ctx.selection,
        style,
        commitOperations,
        deleteSelection,
      });
    },
    [editorRef, commitOperations, deleteSelection]
  );

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;

      const ctx = getEditableTextContext(root);
      if (!ctx) return;

      const behavior = blockBehaviors[ctx.block.type];
      if (!behavior?.onKeyDown) return;

      const handled = behavior.onKeyDown({
        event,
        note: ctx.note,
        block: ctx.block as never,
        selection: ctx.selection,
        commitOperations,
        deleteSelection,
      });

      if (handled) {
        event.stopImmediatePropagation();
      }
    };

    const handleBeforeInput = (event: InputEvent) => {
      if (event.isComposing) return;

      const ctx = getEditableTextContext(root);
      if (!ctx) return;

      if (
        event.inputType === "insertText" &&
        event.data === "/" &&
        isCollapsedEditorSelection(ctx.selection)
      ) {
        const blockText = getBlockPlainText(ctx.block);

        if (blockText.trim() === "") {
          event.preventDefault();
          event.stopImmediatePropagation();

          const blockEl = getBlockElement(root, ctx.block.id);

          if (blockEl) {
            setSlashMenu({
              anchorEl: blockEl,
              blockId: ctx.block.id,
            });
          }

          return;
        }
      }

      const behavior = blockBehaviors[ctx.block.type];
      if (!behavior?.onBeforeInput) return;

      const handled = behavior.onBeforeInput({
        event,
        note: ctx.note,
        block: ctx.block as never,
        selection: ctx.selection,
        commitOperations,
        deleteSelection,
      });

      if (handled) {
        event.stopImmediatePropagation();
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      const ctx = getEditableTextContext(root);
      if (!ctx) return;

      const behavior = blockBehaviors[ctx.block.type];
      if (!behavior?.onPaste) return;

      const handled = behavior.onPaste({
        event,
        note: ctx.note,
        block: ctx.block as never,
        selection: ctx.selection,
        commitOperations,
        deleteSelection,
      });

      if (handled) {
        event.stopImmediatePropagation();
      }
    };

    root.addEventListener("keydown", handleKeyDown, true);
    root.addEventListener("beforeinput", handleBeforeInput, true);
    root.addEventListener("paste", handlePaste, true);

    return () => {
      root.removeEventListener("keydown", handleKeyDown, true);
      root.removeEventListener("beforeinput", handleBeforeInput, true);
      root.removeEventListener("paste", handlePaste, true);
    };
  }, [editorRef, commitOperations, deleteSelection]);

  return {
    applyStyleToSelection,

    isSlashMenuOpen: Boolean(slashMenu.anchorEl && slashMenu.blockId),
    slashMenuAnchorEl: slashMenu.anchorEl,
    slashMenuBlockId: slashMenu.blockId,
    closeSlashMenu,
  };
};