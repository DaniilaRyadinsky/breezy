import { create } from "zustand";
import { SyncType } from "./syncTypes";

type SyncState = {
  queue: SyncType[];
  isRunning: boolean;

  enqueue: (op: SyncType) => void;
  listQueue: (ops: SyncType[]) => void;
  markProcessing: (opId: string) => void;
  markError: (opId: string, error: string) => void;
  incrementRetry: (opId: string) => void;
  remove: (opId: string) => void;
  setRunning: (value: boolean) => void;
};


export const useSyncStore = create<SyncState>((set) => ({
  queue: [],
  isRunning: false,

  enqueue: (op) => set((state) => ({ queue: [...state.queue, op] })),
  listQueue: (ops) => set((state) => ({ queue: [...state.queue, ...ops] })),
  markProcessing: (opId) =>
    set((state) => ({ queue: state.queue.map((op) => op.opId === opId ? { ...op, status: "processing" } : op) })),
  markError: (opId, error) =>
    set((state) => ({ queue: state.queue.map((op) => op.opId === opId ? { ...op, status: "error", lastError: error } : op) })),
  incrementRetry: (opId) =>
    set((state) => ({ queue: state.queue.map((op) => op.opId === opId ? { ...op, retryCount: op.retryCount + 1 } : op) })),
  remove: (opId) =>
    set((state) => ({ queue: state.queue.filter((op) => op.opId !== opId) })),
  setRunning: (value) => set({ isRunning: value }),
}));  