import { useSyncStore } from "../model/syncStore";
import { processSyncQueue } from "./processSyncQueue";

let intervalId: number | null = null;

export const startSyncScheduler = (intervalMs = 5000) => {
  if (intervalId !== null) return;

  intervalId = window.setInterval(() => {
    const { queue, isRunning } = useSyncStore.getState();

    console.log("Sync Scheduler: Checking queue...", { queue, isRunning });

    const hasPending = queue.some((op) => op.status === "pending");

    if (!isRunning && hasPending) {
      void processSyncQueue();
    } 
  }, intervalMs);
};

export const stopSyncScheduler = () => {
  if (intervalId === null) return;
  window.clearInterval(intervalId);
  intervalId = null;
};