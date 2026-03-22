import { Block, BlockType } from "../model/blockTypes";
import { getInsertPositionAfter } from "./getInsertPosition";
import { initBlock } from "./initBlock";

type InsertBlockResult = {
  newBlock: Block;
  pos: number;
  nextBlocks: Block[];
};

export const prepareInsertBlockAfter = (
  blocks: Block[],
  type: BlockType,
  afterId: string
): InsertBlockResult | null => {
  const newBlock = initBlock(type);
  const pos = getInsertPositionAfter(blocks, afterId);

  if (pos === null) return null;

  const nextBlocks = insertBlockAt(blocks, newBlock, pos);

  return {
    newBlock,
    pos,
    nextBlocks,
  };
};

export const insertBlockAt = (
  blocks: Block[],
  newBlock: Block, 
  pos: number
) => {
  const newBlocks = [...blocks];
  newBlocks.splice(pos, 0, newBlock);

  return newBlocks;
}

export const deleteBlock = (
  blocks: Block[],
  deleteId: string
) => {
  const newBlocks = blocks.filter(block => block.id !== deleteId)
  return newBlocks;
}
