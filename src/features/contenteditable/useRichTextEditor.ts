import { BlockOperation } from "@/entities/note/model/operationsType";
import { TextStyle } from "@/entities/note/model/blockTypes";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  PendingEditorSelection,
  EditorSelection,
  getEditorSelection,
  isCollapsedEditorSelection,
  normalizeEditorSelection,
  setEditorSelection,
} from "./lib/editorSelection";
import {
  buildApplyStyleOperations,
  buildDeleteSelectionOperations,
  getSegmentsLength,
  isRichTextBlock,
} from "./lib/documentRichText";

type ApplyDocumentOperations = (
  noteId: string,
  operations: BlockOperation[]
) => void;

type UseRichTextEditorResult = {
  applyStyleToSelection: (style: TextStyle) => void;
};

type ActiveNote = NonNullable<
  ReturnType<typeof useActiveNoteStore.getState>["activeNote"]
>;

export const useRichTextEditor = (
  editorRef: RefObject<HTMLElement | null>,
  onOperations: ApplyDocumentOperations
): UseRichTextEditorResult => {
  const activeNote = useActiveNoteStore((state) => state.activeNote);
  const pendingSelectionRef = useRef<PendingEditorSelection | null>(null);

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
      const note = useActiveNoteStore.getState().activeNote;

      if (!root || !note) return;

      const selection = getEditorSelection(root);
      if (!selection) return;

      const result = buildApplyStyleOperations({
        noteId: note.id,
        note,
        selection,
        style,
      });

      if (!result || !result.operations.length) return;

      commitOperations(result.operations, result.nextSelection);
    },
    [editorRef, commitOperations]
  );

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (e.key !== "Backspace" && e.key !== "Delete") return;

      const note = useActiveNoteStore.getState().activeNote;
      if (!note) return;

      const selection = getEditorSelection(root);
      if (!selection) return;

      const normalized = normalizeEditorSelection(selection, note.blockOrder);

      if (isCollapsedEditorSelection(normalized)) {
        return;
      }

      e.preventDefault();
      deleteSelection(note, normalized);
    };

    const handleBeforeInput = (e: InputEvent) => {
      if (e.isComposing) return;

      const note = useActiveNoteStore.getState().activeNote;
      if (!note) return;

      const selection = getEditorSelection(root);
      if (!selection) return;

      const normalized = normalizeEditorSelection(selection, note.blockOrder);
      const isCollapsed = isCollapsedEditorSelection(normalized);

      switch (e.inputType) {
        case "insertText": {
          const text = e.data ?? "";
          if (!text) return;

          e.preventDefault();

          const ops: BlockOperation[] = [];
          let insertBlockId = normalized.start.blockId;
          let insertOffset = normalized.start.offset;

          if (!isCollapsed) {
            const deleteResult = buildDeleteSelectionOperations({
              noteId: note.id,
              note,
              selection: normalized,
            });

            if (!deleteResult) return;

            ops.push(...deleteResult.operations);
            insertBlockId = deleteResult.nextSelection.start.blockId;
            insertOffset = deleteResult.nextSelection.start.offset;
          }

          ops.push({
            op: "insert_text",
            note_id: note.id,
            block_id: insertBlockId,
            data: {
              pos: insertOffset,
              new_text: text,
            },
          });

          commitOperations(ops, {
            start: {
              blockId: insertBlockId,
              offset: insertOffset + text.length,
            },
            end: {
              blockId: insertBlockId,
              offset: insertOffset + text.length,
            },
          });

          break;
        }

        case "deleteByCut":
        case "deleteContentBackward":
        case "deleteContentForward": {
          if (!isCollapsed) {
            e.preventDefault();
            deleteSelection(note, normalized);
            return;
          }

          if (e.inputType === "deleteContentBackward") {
            e.preventDefault();

            if (normalized.start.offset === 0) return;

            commitOperations(
              [
                {
                  op: "delete_range",
                  note_id: note.id,
                  block_id: normalized.start.blockId,
                  data: {
                    start: normalized.start.offset - 1,
                    end: normalized.start.offset,
                  },
                },
              ],
              {
                start: {
                  blockId: normalized.start.blockId,
                  offset: normalized.start.offset - 1,
                },
                end: {
                  blockId: normalized.start.blockId,
                  offset: normalized.start.offset - 1,
                },
              }
            );

            return;
          }

          if (e.inputType === "deleteContentForward") {
            e.preventDefault();

            const currentBlock = note.blocksById[normalized.start.blockId];
            if (!currentBlock || !isRichTextBlock(currentBlock)) return;

            const fullTextLength = getSegmentsLength(currentBlock.data.text_data);
            if (normalized.start.offset >= fullTextLength) return;

            commitOperations(
              [
                {
                  op: "delete_range",
                  note_id: note.id,
                  block_id: normalized.start.blockId,
                  data: {
                    start: normalized.start.offset,
                    end: normalized.start.offset + 1,
                  },
                },
              ],
              {
                start: {
                  blockId: normalized.start.blockId,
                  offset: normalized.start.offset,
                },
                end: {
                  blockId: normalized.start.blockId,
                  offset: normalized.start.offset,
                },
              }
            );

            return;
          }

          break;
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const note = useActiveNoteStore.getState().activeNote;
      if (!note) return;

      const selection = getEditorSelection(root);
      if (!selection) return;

      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (!text) return;

      e.preventDefault();

      const normalized = normalizeEditorSelection(selection, note.blockOrder);
      const isCollapsed = isCollapsedEditorSelection(normalized);

      const ops: BlockOperation[] = [];
      let insertBlockId = normalized.start.blockId;
      let insertOffset = normalized.start.offset;

      if (!isCollapsed) {
        const deleteResult = buildDeleteSelectionOperations({
          noteId: note.id,
          note,
          selection: normalized,
        });

        if (!deleteResult) return;

        ops.push(...deleteResult.operations);
        insertBlockId = deleteResult.nextSelection.start.blockId;
        insertOffset = deleteResult.nextSelection.start.offset;
      }

      ops.push({
        op: "insert_text",
        note_id: note.id,
        block_id: insertBlockId,
        data: {
          pos: insertOffset,
          new_text: text,
        },
      });

      commitOperations(ops, {
        start: { blockId: insertBlockId, offset: insertOffset + text.length },
        end: { blockId: insertBlockId, offset: insertOffset + text.length },
      });
    };

    root.addEventListener("keydown", handleKeyDown);
    root.addEventListener("beforeinput", handleBeforeInput);
    root.addEventListener("paste", handlePaste);

    return () => {
      root.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("beforeinput", handleBeforeInput);
      root.removeEventListener("paste", handlePaste);
    };
  }, [editorRef, commitOperations, deleteSelection]);

  return {
    applyStyleToSelection,
  };
};