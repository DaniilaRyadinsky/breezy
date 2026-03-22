import { prepareInsertBlockAfter } from "../lib";
import { BlockType, Block } from "./blockTypes";
import { useActiveNoteStore } from "./store";

export const insertBlock = async (type: BlockType, afterId: string) => {
  let syncPayload: { block: Block; pos: number; afterId: string } | null = null;

  useActiveNoteStore.setState((state) => {
    if (!state.activeNote) return state;

    const result = prepareInsertBlockAfter(
      state.activeNote.blocks,
      type,
      afterId
    );

    if (!result) return state;

    syncPayload = {
      block: result.newBlock,
      pos: result.pos,
      afterId,
    };

    return {
      activeNote: {
        ...state.activeNote,
        blocks: result.nextBlocks,
      },
    };
  });

  if (!syncPayload) return null;

  // optimistic update уже произошёл
  // await syncInsertBlock(syncPayload);

  return (syncPayload as { block: Block; pos: number; afterId: string }).block.id;
};