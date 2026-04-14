import { useSyncStore } from "../model/syncStore";
import { SyncType } from "../model/syncTypes";
import { executeSyncOperation } from "./enqueueOperation";

const MAX_RETRIES = 6;

const markBatchProcessing = (batch: SyncType[]) => {
  const ids = new Set(batch.map((op) => op.opId));

  useSyncStore.setState((state) => ({
    queue: state.queue.map((op) =>
      ids.has(op.opId) ? { ...op, status: "processing" as const } : op
    ),
  }));
};


const handleSuccess = (opId: string) => {
  useSyncStore.setState((state) => ({
    queue: state.queue.filter((op) => op.opId !== opId),
  }));
};

const handleFailure = (opId: string, message: string) => {
  useSyncStore.setState((state) => ({
    queue: state.queue.map((op) => {
      if (op.opId !== opId) return op;

      const nextRetryCount = op.retryCount + 1;
      const shouldStopRetrying = nextRetryCount >= MAX_RETRIES;

      if (shouldStopRetrying) {
        return {
          ...op,
          status: "error" as const,
          retryCount: nextRetryCount,
          lastError: message,
        };
      }

      return {
        ...op,
        status: "pending" as const,
        retryCount: nextRetryCount,
        lastError: message,
        nextAttemptAt:
          Date.now() + 1500 * 2 ** Math.max(0, nextRetryCount - 1),
      };
    }),
  }));
};

export const processBatch = async (batch: SyncType[]) => {
  markBatchProcessing(batch);

  await Promise.allSettled(
    batch.map(async (op) => {
      try {
        await executeSyncOperation(op);
        handleSuccess(op.opId);
        console.log(`Operation ${op.payload.op} completed successfully`);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Sync failed";
        handleFailure(op.opId, message);
      }
    })
  );
};