import { Block } from "../../model/blockTypes";

type SyncStatus = "pending" | "processing" | "error";

export type SyncCreate = {
  opId: string;
  type: "create_block";
  payload: {
    note_id: string;
    block: Block;
    pos: number;
  };
  status: SyncStatus;
  retryCount: number;
  lastError?: string;
}

export type SyncDelete = {
  opId: string;
  type: "delete_block";
  payload: {
    note_id: string;
    block_id: string;
  };
  status: SyncStatus;
  retryCount: number;
  lastError?: string;
}

export type SyncOperation =
  | SyncCreate
  | SyncDelete;