import { applyStyleToRange, deleteRange, ensureSegments, getStyleAt, insertTextAt, normalizeSegments } from "@/features/NoteEditor/lib/segmentsUtils";
import {
  Block,
  BlockByType,
  BlockDataByType,
  BlockType,
  ListLevel,
  TextBlockType
} from "../model/blockTypes";
import { ActiveNote } from "../model/noteTypes";
import { ChangeBlockTypeOp, ChangeLevelOp, ChangeSrcOp, RichTextOperation } from "../model/operationsType";

import { convertBlockType } from "./blockConversion";
import { PlainTextBlockType } from "./blockGuards";

export const insertBlockAfter = (
  note: ActiveNote,
  block: Block,
  afterId: string
): { nextNote: ActiveNote; newBlock: Block; pos: number } | null => {
  const index = note.blockOrder.indexOf(afterId);
  if (index === -1) return null;

  const pos = index + 1;
  const nextOrder = [...note.blockOrder];
  nextOrder.splice(pos, 0, block.id);

  const nextBlocksById = {
    ...note.blocksById,
    [block.id]: block,
  };

  return {
    newBlock: block,
    pos,
    nextNote: {
      ...note,
      blockOrder: nextOrder,
      blocksById: nextBlocksById,
    },
  };
};

export const removeBlockById = (
  note: ActiveNote,
  blockId: string
): { nextNote: ActiveNote; focusTargetId: string | null; deletedBlock: Block | null } | null => {
  const index = note.blockOrder.indexOf(blockId);
  if (index === -1) return null;

  const deletedBlock = note.blocksById[blockId] ?? null;

  const nextOrder = note.blockOrder.filter((id) => id !== blockId);

  const nextBlocksById = { ...note.blocksById };
  delete nextBlocksById[blockId];

  const focusTargetId =
    nextOrder[index - 1] ?? nextOrder[index] ?? null;

  return {
    deletedBlock,
    focusTargetId,
    nextNote: {
      ...note,
      blockOrder: nextOrder,
      blocksById: nextBlocksById,
    },
  };
};


export const updateBlock = <T extends BlockType>(
  note: ActiveNote,
  blockId: string,
  type: T,
  data: BlockDataByType<T>
): ActiveNote | null => {
  const currentBlock = note.blocksById[blockId];
  if (!currentBlock) return null;

  if (currentBlock.type !== type) return null;

  const updatedBlock = {
    ...currentBlock,
    data,
  } as BlockByType<T>;

  return {
    ...note,
    blocksById: {
      ...note.blocksById,
      [blockId]: updatedBlock,
    },
  };
};

export const applyRichTextOperationsToTextData = (
  data: TextBlockType["data"],
  operations: RichTextOperation[]
): TextBlockType["data"] => {
  let nextText = ensureSegments(Array.isArray(data?.text_data?.text) ? data.text_data.text : []);

  for (const operation of operations) {
    switch (operation.op) {
      case "insert_text": {
        const style = getStyleAt(nextText, operation.data.pos);
        nextText = insertTextAt(
          nextText,
          operation.data.pos,
          operation.data.new_text,
          style
        );
        break;
      }

      case "delete_range": {
        nextText = deleteRange(
          nextText,
          operation.data.start,
          operation.data.end
        );
        break;
      }

      case "apply_style": {
        nextText = applyStyleToRange(
          nextText,
          operation.data.start,
          operation.data.end,
          operation.data.style
        );
        break;
      }
    }
  }

  return {
    ...data,
    text_data: { text: normalizeSegments(nextText) },
  };
};

export const applyChangeBlockTypeOperation = (
  note: ActiveNote,
  operation: ChangeBlockTypeOp
): ActiveNote | null => {
  const block = note.blocksById[operation.block_id];
  if (!block) return null;

  const nextBlock = convertBlockType(block, operation.data.new_type);
  if (!nextBlock) return null;

  if (nextBlock === block) {
    return note;
  }

  return {
    ...note,
    blocksById: {
      ...note.blocksById,
      [block.id]: nextBlock,
    },
  };
};

export const applyInsertTextToPlainTextBlock = <
  T extends PlainTextBlockType
>(
  block: T,
  pos: number,
  newText: string
): T => {
  const text = block.data.text
  const nextText = text.slice(0, pos) + newText + text.slice(pos)

  return {
    ...block,
    data: {
      ...block.data,
      text: nextText,
    },
  }
}

export const applyDeleteRangeToPlainTextBlock = <
  T extends PlainTextBlockType
>(
  block: T,
  start: number,
  end: number
): T => {
  const text = block.data.text
  const nextText = text.slice(0, start) + text.slice(end)

  return {
    ...block,
    data: {
      ...block.data,
      text: nextText,
    },
  }
}

export const applyChangeLevelOperation = (
  note: ActiveNote,
  operation: ChangeLevelOp
) => {
  const block = note.blocksById[operation.block_id];

  if (!block || block.type !== "list") {
    return note;
  }
  if (operation.data.new_level > 4 || operation.data.new_level < 1) {
    return note;
  }

  return updateBlock(note, block.id, block.type, {
    ...block.data,
    level: operation.data.new_level as ListLevel,
  }) ?? note;
};

export const applyChangeSrcOperation = (
  note: ActiveNote,
  operation: ChangeSrcOp
): ActiveNote | null => {
  const block = note.blocksById[operation.block_id];

  if (!block) return null;

  if (block.type !== "img" && block.type !== "file") {
    return note;
  }

  return updateBlock(note, block.id, block.type, {
    ...block.data,
    src: operation.data.new_src,
  }) ?? note;
};