import { createBlockApi, deleteBlockApi } from "../../api/blockApi";
import { SyncOperation } from "../model/syncTypes";

export const executeSyncOperation = async (op: SyncOperation) => {
  switch (op.type) {
    case "create_block":
      return await createBlockApi(
        op.payload.block,
        op.payload.note_id,
        op.payload.pos
      );

    case "delete_block":
      return await deleteBlockApi(
        op.payload.block_id,
        op.payload.note_id
      );
  }
};