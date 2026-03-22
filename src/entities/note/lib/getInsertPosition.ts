import { Block } from "../model/blockTypes";

export const getInsertPositionAfter = (blocks: Block[], afterId: string) => {
  const index = blocks.findIndex(block => block.id === afterId);
  if (index === -1) return null;
  return index + 1;
};