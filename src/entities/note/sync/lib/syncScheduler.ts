import { useSyncStore } from "../model/syncStore";
import { processSyncQueue } from "./processSyncQueue";

let intervalId: number | null = null;

export const startSyncScheduler = (
  intervalMs = 5000,
  batchSize = 4
) => {
  if (intervalId !== null) return;

  intervalId = window.setInterval(() => {
    const { isRunning, queue } = useSyncStore.getState();

    const hasPending = queue.some(
      (op) => op.status === "pending" && op.nextAttemptAt <= Date.now()
    );

    if (!isRunning && hasPending) {
      void processSyncQueue(batchSize);
    }
  }, intervalMs);
};

export const stopSyncScheduler = () => {
  if (intervalId === null) return;
  window.clearInterval(intervalId);
  intervalId = null;
};