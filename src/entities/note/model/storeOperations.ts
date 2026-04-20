import { BlockOperation, ChangeBlockTypeOp, RichTextOperation } from "@/entities/note/model/operationsType";
import { applyRichTextOperationsToTextData, updateBlock, insertBlockAfter, removeBlockById, applyChangeBlockTypeOperation } from "../lib";
import { useSyncStore } from "../sync/model/syncStore";
import { SyncType } from "../sync/model/syncTypes";
import { BlockType, BlockDataByType } from "./blockTypes";
import { useActiveNoteStore } from "./store";
import { BlockChangeType } from "./blockChangeTypes";

export const createPendingSyncOperation = (
  operation: BlockOperation
): SyncType => {
  const now = Date.now();

  return {
    opId: crypto.randomUUID(),
    payload: operation,
    status: "pending",
    retryCount: 0,
    createdAt: now,
    nextAttemptAt: now,
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


export const createPendingSyncOperations = (
  operations: BlockOperation[]
): SyncType[] => {
  return operations.map(createPendingSyncOperation);
};


export const applyRichTextBatchToBlock = (
  note: any,
  blockId: string,
  operations: RichTextOperation[]
) => {
  if (!operations.length) return note;

  const block = note.blocksById[blockId];
  if (!block || block.type !== "text") return note;

  const nextData = applyRichTextOperationsToTextData(block.data, operations);
  return updateBlock(note, blockId, "text", nextData) ?? note;
};

export const applyStructuralOperationToNote = (
  note: any,
  operation: BlockOperation
) => {
  switch (operation.op) {
    case "delete_block": {
      const block = note.blocksById[operation.block_id];
      if (!block) return note;

      const nextBlocksById = { ...note.blocksById };
      delete nextBlocksById[operation.block_id];

      return {
        ...note,
        blockOrder: note.blockOrder.filter((id: string) => id !== operation.block_id),
        blocksById: nextBlocksById,
      };
    }

    case "create_block": {
      const { block, pos } = operation.data;
      const nextBlockOrder = [...note.blockOrder];
      nextBlockOrder.splice(pos, 0, block.id);

      return {
        ...note,
        blockOrder: nextBlockOrder,
        blocksById: {
          ...note.blocksById,
          [block.id]: block,
        },
      };
    }

    case "change_block_type": {
      return applyChangeBlockTypeOperation(note, operation) ?? note;
    }

    default:
      return note;
  }
};

export const applyOperationsToNote = (
  note: any,
  operations: BlockOperation[]
) => {
  let nextNote = note;

  let pendingBlockId: string | null = null;
  let pendingTextOps: RichTextOperation[] = [];

  const flushPendingTextOps = () => {
    if (!pendingBlockId || !pendingTextOps.length) return;

    nextNote = applyRichTextBatchToBlock(nextNote, pendingBlockId, pendingTextOps);
    pendingBlockId = null;
    pendingTextOps = [];
  };

  for (const operation of operations) {
    if (isRichTextOperation(operation)) {
      const currentBlock = nextNote.blocksById[operation.block_id];

      if (!currentBlock || currentBlock.type !== "text") {
        flushPendingTextOps();
        continue;
      }

      if (pendingBlockId === operation.block_id) {
        pendingTextOps.push(operation);
        continue;
      }

      flushPendingTextOps();
      pendingBlockId = operation.block_id;
      pendingTextOps = [operation];
      continue;
    }

    flushPendingTextOps();
    nextNote = applyStructuralOperationToNote(nextNote, operation);
  }

  flushPendingTextOps();

  return nextNote;
};


export const insertBlock = (type: BlockType, afterId: string) => {
  let createdBlockId: string | null = null;
  let syncOperation: SyncType | null = null;

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note) return state;

    const result = insertBlockAfter(note, type, afterId);
    if (!result) return state;

    createdBlockId = result.newBlock.id;

    syncOperation = createPendingSyncOperation({
      op: "create_block",
      data: {
        block: result.newBlock,
        pos: result.pos,
      },
      note_id: note.id,
      block_id: result.newBlock.id,
    });

    return {
      activeNote: result.nextNote,
    };
  });

  if (syncOperation) {
    useSyncStore.getState().enqueue(syncOperation);
  }

  return createdBlockId;
};

export const deleteBlock = (blockId: string) => {
  let focusTargetId: string | null = null;
  let syncOperation: SyncType | null = null;

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note) return state;

    const result = removeBlockById(note, blockId);
    if (!result) return state;

    focusTargetId = result.focusTargetId;

    syncOperation = createPendingSyncOperation({
      op: "delete_block",
      note_id: note.id,
      block_id: blockId,
      data: {},
    });

    return {
      activeNote: result.nextNote,
    };
  });

  if (syncOperation) {
    useSyncStore.getState().enqueue(syncOperation);
  }

  return focusTargetId;
};

export const updateBlockContent = <T extends BlockType>(
  blockId: string,
  type: T,
  data: BlockDataByType<T>
) => {
  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note) return state;

    const nextNote = updateBlock(note, blockId, type, data);
    if (!nextNote) return state;

    return { activeNote: nextNote };
  });
};

export const applyDocumentOperations = (
  noteId: string,
  operations: BlockOperation[]
) => {
  if (!operations.length) return;

  let syncOperations: SyncType[] = [];

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note || note.id !== noteId) return state;

    const nextNote = applyOperationsToNote(note, operations);
    syncOperations = createPendingSyncOperations(operations);

    return {
      activeNote: nextNote,
    };
  });

  if (syncOperations.length) {
    useSyncStore.getState().listQueue(syncOperations);
  }
};


export const changeBlockType = (
  blockId: string,
  newType: BlockChangeType
) => {
  let syncOperation: SyncType | null = null;
  let didChange = false;

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note) return state;

    const block = note.blocksById[blockId];
    if (!block) return state;

    const operation: ChangeBlockTypeOp = {
      op: "change_block_type",
      note_id: note.id,
      block_id: blockId,
      data: {
        new_type: newType,
      },
    };

    const nextNote = applyChangeBlockTypeOperation(note, operation);
    if (!nextNote || nextNote === note) return state;

    didChange = true;
    syncOperation = createPendingSyncOperation(operation);

    return {
      activeNote: nextNote,
    };
  });

  if (didChange && syncOperation) {
    useSyncStore.getState().enqueue(syncOperation);
  }
};