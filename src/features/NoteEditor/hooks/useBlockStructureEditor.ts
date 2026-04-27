import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import { BlockOperation } from "@/entities/note/model/operationsType";
import { useActiveNoteStore } from "@/entities/note/model/store";

import {
  EditorSelection,
  PendingEditorSelection,
} from "@/features/NoteEditor/lib/selection";

import { getEditableTextContext } from "@/features/NoteEditor/lib/getEditableTextContext";
import { setEditorSelection } from "@/features/NoteEditor/lib/editorSelection";

import { buildDeleteSelectionOperations } from "@/features/NoteEditor/lib/documentRichText";
import { blockBehaviors } from "../model/behaviors/registry";

type ApplyDocumentOperations = (
  noteId: string,
  operations: BlockOperation[]
) => void;

type ActiveNote = NonNullable<
  ReturnType<typeof useActiveNoteStore.getState>["activeNote"]
>;

export const useBlockStructureEditor = (
  editorRef: RefObject<HTMLElement | null>,
  onOperations: ApplyDocumentOperations
) => {
  const activeNote = useActiveNoteStore((state) => state.activeNote);
  const pendingSelectionRef = useRef<PendingEditorSelection | null>(null);

  const commitOperations = useCallback(
    (operations: BlockOperation[], nextSelection: PendingEditorSelection) => {
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
};