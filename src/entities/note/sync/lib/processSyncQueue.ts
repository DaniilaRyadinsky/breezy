import { Block } from "../../model/blockTypes";
import { useSyncStore } from "../model/syncStore";
import { compactSyncItems } from "./mergeOperations";
import { useActiveNoteStore } from "../../model/store";
import { SyncType } from "../model/syncTypes";
import { processBatch } from "./processBatch";

const getBlockSnapshot = (
  noteId: string,
  blockId: string
): Block | undefined => {
  const { activeNote } = useActiveNoteStore.getState();

  if (!activeNote) return undefined;
  if (activeNote.id !== noteId) return undefined;

  return activeNote.blocksById[blockId];
};

const getOpKey = (op: SyncType) =>
  `${op.payload.note_id}:${op.payload.block_id}`;

export const compactPendingQueue = (force = false) => {
  const store = useSyncStore.getState();
  if (store.isRunning && !force) return;

  const queue = store.queue;
  const pending = queue.filter((item) => item.status === "pending");

  if (pending.length <= 1) return;

  const compactedPending = compactSyncItems(pending, getBlockSnapshot);

  let inserted = false;
  const nextQueue: typeof queue = [];

  for (const item of queue) {
    if (item.status !== "pending") {
      nextQueue.push(item);
      continue;
    }

    if (!inserted) {
      nextQueue.push(...compactedPending);
      inserted = true;
    }
  }
  console.log("queue length after compacting:", nextQueue);

  store.setQueue(nextQueue);
};

export const getReadyBatch = (batchSize: number): SyncType[] => {
  const now = Date.now();
  const queue = useSyncStore.getState().queue;

  const usedKeys = new Set<string>();
  const batch: SyncType[] = [];

  for (const op of queue) {
    if (op.status !== "pending") continue;
    if (op.nextAttemptAt > now) continue;

    const key = getOpKey(op);
    if (usedKeys.has(key)) continue;

    usedKeys.add(key);
    batch.push(op);

    if (batch.length >= batchSize) break;
  }

  return batch;
};


export const processSyncQueue = async (batchSize = 4) => {
  const syncState = useSyncStore.getState();

  if (syncState.isRunning) return;
  console.log("queue length before compacting:", syncState.queue.length);

  compactPendingQueue(true);
  useSyncStore.getState().setRunning(true);

  try {
    while (true) {
      const batch = getReadyBatch(batchSize);
      if (batch.length === 0) break;

      await processBatch(batch);

      compactPendingQueue(true);
    }

  } finally {
    useSyncStore.getState().setRunning(false);
  }
};