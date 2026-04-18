import { BlockOperation } from "@/entities/note/model/operationsType";
import { TextStyle } from "@/entities/note/model/blockTypes";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  PendingEditorSelection,
  getEditorSelection,
  isCollapsedEditorSelection,
  normalizeEditorSelection,
  setEditorSelection,
} from "./lib/editorSelection";
import {
  buildApplyStyleOperations,
  buildDeleteSelectionOperations,
  getBlockSegments,
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
            start: { blockId: insertBlockId, offset: insertOffset + text.length },
            end: { blockId: insertBlockId, offset: insertOffset + text.length },
          });

          break;
        }

        case "deleteContentBackward": {
          e.preventDefault();

          if (!isCollapsed) {
            const deleteResult = buildDeleteSelectionOperations({
              noteId: note.id,
              note,
              selection: normalized,
            });

            if (!deleteResult) return;
            commitOperations(deleteResult.operations, deleteResult.nextSelection);
            return;
          }

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

          break;
        }

        case "deleteContentForward": {
          e.preventDefault();

          if (!isCollapsed) {
            const deleteResult = buildDeleteSelectionOperations({
              noteId: note.id,
              note,
              selection: normalized,
            });

            if (!deleteResult) return;
            commitOperations(deleteResult.operations, deleteResult.nextSelection);
            return;
          }

          const currentBlock = note.blocksById[normalized.start.blockId];
          if (!currentBlock || !isRichTextBlock(currentBlock)) return;

          const fullTextLength = getSegmentsLength(getBlockSegments(currentBlock));
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

    root.addEventListener("beforeinput", handleBeforeInput);
    root.addEventListener("paste", handlePaste);

    return () => {
      root.removeEventListener("beforeinput", handleBeforeInput);
      root.removeEventListener("paste", handlePaste);
    };
  }, [editorRef, commitOperations]);

  return {
    applyStyleToSelection,
  };
};