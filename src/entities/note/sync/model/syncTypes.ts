import { BlockOperation } from "../../model/operationsType";

type SyncStatus = "pending" | "processing" | "error";

export type SyncType = {
  opId: string;
  status: SyncStatus;
  retryCount: number;
  lastError?: string;
  payload: BlockOperation;
}