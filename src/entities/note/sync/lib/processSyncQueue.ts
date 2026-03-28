import { useSyncStore } from "../model/syncStore";
import { processNextOperation } from "./processNextOperation";

export const processSyncQueue = async () => {
  const syncStore = useSyncStore.getState();

  if (syncStore.isRunning) return;

  syncStore.setRunning(true);

  try {
    while (true) {
      const current = useSyncStore
        .getState()
        .queue.find((op) => op.status === "pending");

      if (!current) break;

      await processNextOperation();
    }
  } finally {
    useSyncStore.getState().setRunning(false);
  }
};