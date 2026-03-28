import { useSyncStore } from "../model/syncStore";
import { processSyncQueue } from "./processSyncQueue";

export const retryOperation = async (opId: string) => {
  useSyncStore.setState((state) => ({
    queue: state.queue.map((op) =>
      op.opId === opId
        ? { ...op, status: "pending", lastError: undefined }
        : op
    ),
  }));

  await processSyncQueue();
};

export const retryAllOperations = async () => {
  useSyncStore.setState((state) => ({
    queue: state.queue.map((op) =>
      op.status === "error"
        ? { ...op, status: "pending", lastError: undefined }
        : op
    ),
  }));

  await processSyncQueue();
};