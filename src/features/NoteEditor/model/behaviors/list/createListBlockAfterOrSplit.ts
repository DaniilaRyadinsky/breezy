import { ListBlockType } from "@/entities/note/model/blockTypes";
import { getSegmentsLength } from "@/features/NoteEditor/lib/documentRichText";
import { splitSegments } from "@/features/NoteEditor/lib/segmentsUtils";
import { isCollapsedEditorSelection } from "@/features/NoteEditor/lib/selection";
import { BlockBehaviorContext } from "../types";

export const createListBlockAfterOrSplit = (
  ctx: BlockBehaviorContext<ListBlockType, KeyboardEvent>
) => {
  const { event, note, block, selection, commitOperations } = ctx;

  if (!isCollapsedEditorSelection(selection)) {
    event.preventDefault();
    ctx.deleteSelection(note, selection);
    return true;
  }

  const currentIndex = note.blockOrder.indexOf(block.id);
  if (currentIndex === -1) return true;

  const offset = selection.start.offset;
  const textLength = getSegmentsLength(block.data.text_data.text);

  event.preventDefault();

  const getNextValue = () => {
    if (block.data.type !== "ordered") {
      return block.data.value;
    }

    return block.data.value + 1;
  };

  if (offset === textLength) {
    const newBlock: ListBlockType = {
      ...block,
      id: crypto.randomUUID(),
      data: {
        ...block.data,
        value: getNextValue(),
        text_data: {
          text: [],
        },
      },
    };

    commitOperations(
      [
        {
          op: "create_block",
          note_id: note.id,
          block_id: newBlock.id,
          data: {
            block: newBlock,
            pos: currentIndex + 1,
          },
        },
      ],
      {
        start: {
          blockId: newBlock.id,
          offset: 0,
        },
        end: {
          blockId: newBlock.id,
          offset: 0,
        },
      }
    );

    return true;
  }

  const { left, right } = splitSegments(block.data.text_data.text, offset);

  const leftBlock: ListBlockType = {
    ...block,
    id: crypto.randomUUID(),
    data: {
      ...block.data,
      text_data: {
        text: left,
      },
    },
  };

  const rightBlock: ListBlockType = {
    ...block,
    id: crypto.randomUUID(),
    data: {
      ...block.data,
      value: getNextValue(),
      text_data: {
        text: right,
      },
    },
  };

  commitOperations(
    [
      {
        op: "delete_block",
        note_id: note.id,
        block_id: block.id,
        data: {},
      },
      {
        op: "create_block",
        note_id: note.id,
        block_id: leftBlock.id,
        data: {
          block: leftBlock,
          pos: currentIndex,
        },
      },
      {
        op: "create_block",
        note_id: note.id,
        block_id: rightBlock.id,
        data: {
          block: rightBlock,
          pos: currentIndex + 1,
        },
      },
    ],
    {
      start: {
        blockId: rightBlock.id,
        offset: 0,
      },
      end: {
        blockId: rightBlock.id,
        offset: 0,
      },
    }
  );

  return true;
};