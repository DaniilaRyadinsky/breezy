import {
  Block,
  BlockByType,
  BlockDataByType,
  BlockType,
  TextBlockType
} from "../model/blockTypes";
import { ActiveNote } from "../model/noteTypes";
import { initBlock } from "./initBlock";
import { RichTextOperation } from "../model/operationsType";
import {
  deleteRange,
  applyStyleToRange,
  insertTextAt,
  getStyleAt,
  normalizeSegments,
  ensureSegments
} from "@/features/contenteditable";

export const insertBlockAfter = (
  note: ActiveNote,
  type: BlockType,
  afterId: string
): { nextNote: ActiveNote; newBlock: Block; pos: number } | null => {
  const index = note.blockOrder.indexOf(afterId);
  if (index === -1) return null;

  const newBlock = initBlock(type);
  const pos = index + 1;

  const nextOrder = [...note.blockOrder];
  nextOrder.splice(pos, 0, newBlock.id);

  const nextBlocksById = {
    ...note.blocksById,
    [newBlock.id]: newBlock,
  };

  return {
    newBlock,
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
  let nextText = ensureSegments(Array.isArray(data?.text_data) ? data.text_data : []);

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
    text_data: normalizeSegments(nextText),
  };
};