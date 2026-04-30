import { BlockOperation, ChangeBlockTypeOp, RichTextOperation } from "@/entities/note/model/operationsType";
import { applyRichTextOperationsToTextData, updateBlock, insertBlockAfter, removeBlockById, applyChangeBlockTypeOperation, applyDeleteRangeToPlainTextBlock, applyInsertTextToPlainTextBlock, applyChangeSrcOperation, applyChangeLevelOperation } from "../lib";
import { useSyncStore } from "../sync/model/syncStore";
import { SyncType } from "../sync/model/syncTypes";
import { BlockType, BlockDataByType, Block } from "./blockTypes";
import { useActiveNoteStore } from "./store";
import { BlockChangeType } from "./blockChangeTypes";
import { ActiveNote } from "./noteTypes";
import { isRichTextBlock, PlainTextOperation, isPlainTextBlock, TextEditingOperation, isPlainTextOperation, isTextEditingOperation } from "../lib/blockGuards";

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



export const createPendingSyncOperations = (
  operations: BlockOperation[]
): SyncType[] => {
  return operations.map(createPendingSyncOperation);
};

type NoteUpdaterResult<T = void> = {
  nextNote: ActiveNote;
  sideEffect?: T;
};

const updateActiveNote = <T>(
  updater: (note: ActiveNote) => NoteUpdaterResult<T> | null
): T | null => {
  let sideEffect: T | null = null;

  useActiveNoteStore.setState((state) => {
    const note = state.activeNote;
    if (!note) return state;

    const result = updater(note);
    if (!result) return state;

    sideEffect = result.sideEffect ?? null;
    return { activeNote: result.nextNote };
  });

  return sideEffect;
};


export const applyRichTextBatchToBlock = (
  note: ActiveNote,
  blockId: string,
  operations: RichTextOperation[]
) => {
  if (!operations.length) return note;

  const block = note.blocksById[blockId];
  if (!block || !isRichTextBlock(block)) return note;

  const nextData = applyRichTextOperationsToTextData(block.data, operations);
  return updateBlock(note, blockId, block.type, nextData) ?? note;
};

export const applyStructuralOperationToNote = (
  note: ActiveNote,
  operation: BlockOperation
) => {
  switch (operation.op) {
    case "delete_block":
      return removeBlockById(note, operation.block_id)?.nextNote ?? note;

    case "create_block":
      return insertBlockAfter(
        note,
        operation.data.block,
        note.blockOrder[operation.data.pos - 1] ?? ""
      )?.nextNote ?? {
        ...note,
        blockOrder: [
          ...note.blockOrder.slice(0, operation.data.pos),
          operation.data.block.id,
          ...note.blockOrder.slice(operation.data.pos),
        ],
        blocksById: {
          ...note.blocksById,
          [operation.data.block.id]: operation.data.block,
        },
      };

    case "change_block_type":
      return applyChangeBlockTypeOperation(note, operation) ?? note;

    case "change_level":
      return applyChangeLevelOperation(note, operation) ?? note;
      
    case "change_src":
      return applyChangeSrcOperation(note, operation) ?? note;

    default:
      return note;
  }
};

export const applyPlainTextBatchToBlock = (
  note: ActiveNote,
  blockId: string,
  operations: PlainTextOperation[]
) => {
  if (!operations.length) return note;

  const block = note.blocksById[blockId];
  if (!block || !isPlainTextBlock(block)) return note;

  let nextBlock = block;

  for (const operation of operations) {
    switch (operation.op) {
      case "insert_text":
        nextBlock = applyInsertTextToPlainTextBlock(
          nextBlock,
          operation.data.pos,
          operation.data.new_text
        );
        break;

      case "delete_range":
        nextBlock = applyDeleteRangeToPlainTextBlock(
          nextBlock,
          operation.data.start,
          operation.data.end
        );
        break;
    }
  }

  return updateBlock(note, blockId, nextBlock.type, nextBlock.data) ?? note;
};

const applyTextBatchToBlock = (
  note: ActiveNote,
  blockId: string,
  operations: TextEditingOperation[]
) => {
  const block = note.blocksById[blockId];
  if (!block) return note;

  if (isRichTextBlock(block)) {
    return applyRichTextBatchToBlock(note, blockId, operations as RichTextOperation[]);
  }

  if (isPlainTextBlock(block)) {
    return applyPlainTextBatchToBlock(
      note,
      blockId,
      operations.filter(isPlainTextOperation)
    );
  }

  return note;
};

export const applyOperationsToNote = (
  note: ActiveNote,
  operations: BlockOperation[]
) => {
  let nextNote = note;

  let pendingBlockId: string | null = null;
  let pendingTextOps: TextEditingOperation[] = [];

  const flushPendingTextOps = () => {
    if (!pendingBlockId || !pendingTextOps.length) return;

    nextNote = applyTextBatchToBlock(nextNote, pendingBlockId, pendingTextOps);
    pendingBlockId = null;
    pendingTextOps = [];
  };

  for (const operation of operations) {
    if (isTextEditingOperation(operation)) {
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


export const insertBlock = (block: Block, afterId: string) => {
  const sideEffect = updateActiveNote((note) => {
    const result = insertBlockAfter(note, block, afterId);
    if (!result) return null;

    return {
      nextNote: result.nextNote,
      sideEffect: {
        createdBlockId: result.newBlock.id,
        syncOperation: createPendingSyncOperation({
          op: "create_block",
          data: {
            block: result.newBlock,
            pos: result.pos,
          },
          note_id: note.id,
          block_id: result.newBlock.id,
        }),
      },
    };
  });

  if (sideEffect?.syncOperation) {
    useSyncStore.getState().enqueue(sideEffect.syncOperation);
  }

  return sideEffect?.createdBlockId ?? null;
};

export const deleteBlock = (blockId: string) => {
  const sideEffect = updateActiveNote((note) => {
    const result = removeBlockById(note, blockId);
    if (!result) return null;

    return {
      nextNote: result.nextNote,
      sideEffect: {
        focusTargetId: result.focusTargetId,
        syncOperation: createPendingSyncOperation({
          op: "delete_block",
          note_id: note.id,
          block_id: blockId,
          data: {},
        }),
      },
    };
  });

  if (sideEffect?.syncOperation) {
    useSyncStore.getState().enqueue(sideEffect.syncOperation);
  }

  return sideEffect?.focusTargetId ?? null;
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
  console.log("Changing block type", blockId, newType);
  const syncOperation = updateActiveNote((note) => {
    const operation: ChangeBlockTypeOp = {
      op: "change_block_type",
      note_id: note.id,
      block_id: blockId,
      data: { new_type: newType },
    };

    const nextNote = applyChangeBlockTypeOperation(note, operation);
    if (!nextNote || nextNote === note) return null;

    return {
      nextNote,
      sideEffect: createPendingSyncOperation(operation),
    };
  });

  if (syncOperation) {
    useSyncStore.getState().enqueue(syncOperation);
  }
};