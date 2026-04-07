import { Block } from "../model/blockTypes";
import { ActiveNote, Note } from "../model/noteTypes";

export const normalizeNote = (note: Note): ActiveNote => {
  const blockOrder: string[] = [];
  const blocksById: Record<string, Block> = {};

  for (const block of note.blocks) {
    blockOrder.push(block.id);
    blocksById[block.id] = block;
  }

  console.log("нормализованная заметка", {
    id: note.id,
    title: note.title,
    blockOrder,
    blocksById,
  });

  return {
    id: note.id,
    title: note.title,
    blockOrder,
    blocksById,
  };
};


export const denormalizeNote = (note: ActiveNote): Block[] => {
  return note.blockOrder
    .map((id) => note.blocksById[id])
    .filter(Boolean);
};