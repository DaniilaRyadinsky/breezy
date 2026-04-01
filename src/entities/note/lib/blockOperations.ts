import { Block, BlockByType, BlockDataByType, BlockType } from "../model/blockTypes";
import { ActiveNote } from "../model/noteTypes";
import { initBlock } from "./initBlock";

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