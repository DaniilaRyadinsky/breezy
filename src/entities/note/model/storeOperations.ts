import { removeBlockById, insertBlockAfter, updateBlock, applyRichTextOperationsToTextData } from "../lib";
import { processSyncQueue } from "../sync/lib/processSyncQueue";
import { useSyncStore } from "../sync/model/syncStore";
import { SyncType } from "../sync/model/syncTypes";
import { BlockDataByType, BlockType } from "./blockTypes";
import { RichTextOperation } from "./operationsType";
import { useActiveNoteStore } from "./store";

export const insertBlock = async (type: BlockType, afterId: string) => {
  let syncOperation: SyncType | null = null;
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
      payload: {
        op: "create_block",
        data: {
          block: result.newBlock,
          pos: result.pos,
        },
        note_id: state.activeNote.id!,
        block_id: result.newBlock.id,
      },
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
      nextAttemptAt: Date.now(),
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
  // void processSyncQueue();

  return createdBlockId;
};



export const deleteBlock = async (blockId: string) => {
  let focusTargetId: string | null = null;
  let syncOperation: SyncType | null = null;

  useActiveNoteStore.setState((state) => {
    if (!state.activeNote) return state;

    const result = removeBlockById(state.activeNote, blockId);
    if (!result) return state;

    focusTargetId = result.focusTargetId;

    syncOperation = {
      opId: crypto.randomUUID(),
      payload: {
        op: "delete_block",
        note_id: state.activeNote.id,
        block_id: blockId,
        data: {},
      },
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
      nextAttemptAt: Date.now(),
    };

    return {
      activeNote: result.nextNote,
    };
  });

  if (syncOperation) {
    useSyncStore.getState().enqueue(syncOperation);
    // void processSyncQueue();
  }

  return focusTargetId;
};

export const updateBlockContent = async <T extends BlockType>(
  blockId: string,
  type: T,
  data: BlockDataByType<T>
) => {

  useActiveNoteStore.setState((state) => {
    if (!state.activeNote) return state;

    const result = updateBlock(
      state.activeNote,
      blockId,
      type,
      data
    );

    if (!result) return state;

    return { activeNote: result };

  });

  // if (syncOperation) {
  //   useSyncStore.getState().enqueue(syncOperation);
  //   void processSyncQueue();
  // }
}

export const applyTextBlockOperations = (
  note_id: string,
  block_id: string,
  operations: RichTextOperation[]
) => {
  let syncOperations: SyncType[] | null = null;

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note) return state;

    // если у тебя поле называется иначе, просто замени note.id
    if (note.id !== note_id) return state;

    const currentBlock = note.blocksById[block_id];
    if (!currentBlock) return state;
    if (currentBlock.type !== "text") return state;

    const nextData = applyRichTextOperationsToTextData(
      currentBlock.data,
      operations
    );

    const updatedNote = updateBlock(note, block_id, "text", nextData);
    if (!updatedNote) return state;

    syncOperations = operations.map((operation) => ({
      opId: crypto.randomUUID(),
      payload: operation,
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
      nextAttemptAt: Date.now(),
    }));

    return {
      activeNote: updatedNote,
    };
  });

  if (syncOperations) {
    useSyncStore.getState().listQueue(syncOperations);
    // void processSyncQueue();
  }
};