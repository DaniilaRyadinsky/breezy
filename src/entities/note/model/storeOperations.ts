import { removeBlockById, insertBlockAfter } from "../lib";
import { processSyncQueue } from "../sync/lib/processSyncQueue";
import { useSyncStore } from "../sync/model/syncStore";
import { SyncDelete, SyncCreate } from "../sync/model/syncTypes";
import { BlockType } from "./blockTypes";
import { useActiveNoteStore } from "./store";

export const insertBlock = async (type: BlockType, afterId: string) => {
  let syncOperation: SyncCreate | null = null;
  let createdBlockId: string | null = null;

  useActiveNoteStore.setState((state) => {
    if (!state.activeNote) return state;

    const result = insertBlockAfter(
      state.activeNote,
      type,
      afterId
    );

    if (!result) return state;

    createdBlockId = result.newBlock.id;

    syncOperation = {
      opId: crypto.randomUUID(),
      type: "create_block",
      payload: {
        note_id: state.activeNote.id!,
        block: result.newBlock,
        pos: result.pos,
      },
      status: "pending",
      retryCount: 0
    };

    return {
      activeNote: {
        ...state.activeNote,
        blockOrder: result.nextNote.blockOrder,
        blocksById: result.nextNote.blocksById,
      },
    };
  });

  if (!syncOperation || !createdBlockId) return null;

  useSyncStore.getState().enqueue(syncOperation);
  void processSyncQueue();

  return createdBlockId;
};



export const deleteBlock = async (blockId: string) => {
  let focusTargetId: string | null = null;
  let syncOperation: SyncDelete | null = null;

  useActiveNoteStore.setState((state) => {
    if (!state.activeNote) return state;

    const result = removeBlockById(state.activeNote, blockId);
    if (!result) return state;

    focusTargetId = result.focusTargetId;

    syncOperation = {
      opId: crypto.randomUUID(),
      type: "delete_block",
      payload: {
        note_id: state.activeNote.id,
        block_id: blockId,
      },
      status: "pending",
      retryCount: 0,
    };

    return {
      activeNote: result.nextNote,
    };
  });

  if (syncOperation) {
    useSyncStore.getState().enqueue(syncOperation);
    void processSyncQueue();
  }

  return focusTargetId;
};