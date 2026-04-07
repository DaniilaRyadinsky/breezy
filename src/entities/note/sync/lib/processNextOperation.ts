import { useSyncStore } from "../model/syncStore";
import { executeSyncOperation } from "./enqueueOperation";

export const processNextOperation = async () => {
  const syncState = useSyncStore.getState();

  const nextOp = syncState.queue.find((op) => op.status === "pending");
  if (!nextOp) return;

  syncState.markProcessing(nextOp.opId);

  try {
    await executeSyncOperation(nextOp);
    useSyncStore.getState().remove(nextOp.opId);
    console.log(`Operation ${nextOp.payload.op} completed successfully`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";

    useSyncStore.getState().incrementRetry(nextOp.opId);
    useSyncStore.getState().markError(nextOp.opId, message);
  }
};