import { useCallback, RefObject } from "react";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { applyDocumentOperations } from "@/entities/note/model/storeOperations";
import { createEmptyTextBlock } from "../model/behaviors/shared/createEmptyTextBlock";
import { PendingEditorSelection } from "../lib/selection";
import { getSegmentsLength } from "../lib/documentRichText";

export type UseEditorBlockCreationOptions = {
  editorRef: RefObject<HTMLElement | null>;
  onPendingSelection?: (selection: PendingEditorSelection) => void;
};

export const useEditorBlockCreation = ({
  editorRef,
  onPendingSelection,
}: UseEditorBlockCreationOptions) => {
  const createBlockAtEnd = useCallback(() => {
    const activeNote = useActiveNoteStore.getState().activeNote;

    if (!activeNote) return null;

    const lastBlockId = activeNote.blockOrder.at(-1);
    const lastBlock = lastBlockId ? activeNote.blocksById[lastBlockId] : null;

    if (lastBlock?.type === "text") {
      const offset = getSegmentsLength(lastBlock.data.text_data.text);

      onPendingSelection?.({
        start: { blockId: lastBlock.id, offset },
        end: { blockId: lastBlock.id, offset },
      });

      return lastBlock;
    }

    const block = createEmptyTextBlock(activeNote.blockOrder.length);

    applyDocumentOperations(activeNote.id, [
      {
        op: "create_block",
        note_id: activeNote.id,
        block_id: block.id,
        data: {
          block,
          pos: activeNote.blockOrder.length,
        },
      },
    ]);

    onPendingSelection?.({
      start: { blockId: block.id, offset: 0 },
      end: { blockId: block.id, offset: 0 },
    });

    return block;
  }, [onPendingSelection]);

  return {
    createBlockAtEnd,
  };
};