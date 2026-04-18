import { removeBlockById, insertBlockAfter, updateBlock, applyRichTextOperationsToTextData } from "../lib";
import { processSyncQueue } from "../sync/lib/processSyncQueue";
import { useSyncStore } from "../sync/model/syncStore";
import { SyncType } from "../sync/model/syncTypes";
import { BlockDataByType, BlockType } from "./blockTypes";
import { BlockOperation, RichTextOperation } from "./operationsType";
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

}

const flushPendingTextOps = (
  note: any,
  blockId: string | null,
  pendingOps: RichTextOperation[]
) => {
  if (!blockId || pendingOps.length === 0) {
    return { note, blockId: null, pendingOps: [] as RichTextOperation[] };
  }

  const block = note.blocksById[blockId];
  if (!block || block.type !== "text") {
    return { note, blockId: null, pendingOps: [] as RichTextOperation[] };
  }

  const nextData = applyRichTextOperationsToTextData(block.data, pendingOps);
  const updatedNote = updateBlock(note, blockId, "text", nextData);

  return {
    note: updatedNote ?? note,
    blockId: null,
    pendingOps: [] as RichTextOperation[],
  };
};

export const isRichTextOperation = (
  op: BlockOperation
): op is RichTextOperation => {
  return (
    op.op === "insert_text" ||
    op.op === "delete_range" ||
    op.op === "apply_style"
  );
};

export const applyDocumentOperations = (
  noteId: string,
  operations: BlockOperation[]
) => {
  let syncOperations: SyncType[] | null = null;

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note || note.id !== noteId) return state;

    let nextNote = note;

    let pendingBlockId: string | null = null;
    let pendingTextOps: RichTextOperation[] = [];

    const flush = () => {
      const result = flushPendingTextOps(nextNote, pendingBlockId, pendingTextOps);
      nextNote = result.note;
      pendingBlockId = result.blockId;
      pendingTextOps = result.pendingOps;
    };

    for (const operation of operations) {
      if (isRichTextOperation(operation)) {
        const currentBlock = nextNote.blocksById[operation.block_id];

        if (!currentBlock || currentBlock.type !== "text") {
          flush();
          continue;
        }

        if (pendingBlockId === null) {
          pendingBlockId = operation.block_id;
          pendingTextOps = [operation];
          continue;
        }

        if (pendingBlockId === operation.block_id) {
          pendingTextOps.push(operation);
          continue;
        }

        flush();
        pendingBlockId = operation.block_id;
        pendingTextOps = [operation];
        continue;
      }

      flush();

      switch (operation.op) {
        case "delete_block": {
          const block = nextNote.blocksById[operation.block_id];
          if (!block) break;

          const nextBlockOrder = nextNote.blockOrder.filter(
            (id: string) => id !== operation.block_id
          );

          const nextBlocksById = { ...nextNote.blocksById };
          delete nextBlocksById[operation.block_id];

          nextNote = {
            ...nextNote,
            blockOrder: nextBlockOrder,
            blocksById: nextBlocksById,
          };

          break;
        }

        case "create_block": {
          const { block, pos } = operation.data;

          const nextBlockOrder = [...nextNote.blockOrder];
          nextBlockOrder.splice(pos, 0, block.id);

          nextNote = {
            ...nextNote,
            blockOrder: nextBlockOrder,
            blocksById: {
              ...nextNote.blocksById,
              [block.id]: block,
            },
          };

          break;
        }

        default:
          break;
      }
    }

    flush();

    syncOperations = operations.map((operation) => ({
      opId: crypto.randomUUID(),
      payload: operation,
      status: "pending",
      retryCount: 0,
      createdAt: Date.now(),
      nextAttemptAt: Date.now(),
    }));

    return {
      activeNote: nextNote,
    };
  });

  if (syncOperations) {
    useSyncStore.getState().listQueue(syncOperations);
  }
};