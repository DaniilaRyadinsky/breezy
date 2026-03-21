import { Block } from "./blockTypes";

export const insertBlockAfter = (
  blocks: Block[],
  afterId: string,
  newBlock: Block) => {
  const index = blocks.findIndex(block => block.id === afterId)

  if (index === -1) return blocks;

  const newBlocks = [...blocks];
  newBlocks.splice(index + 1, 0, newBlock);

  return newBlocks;
}

export const deleteBlock = (
  blocks: Block[],
  deleteId: string
) => {
  const newBlocks = blocks.filter(block => block.id !== deleteId)
  return newBlocks;
}
