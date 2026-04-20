import { changeBlockTypeApi, createBlockApi, deleteBlockApi, operationsApi } from "../../api/blockApi";
import { SyncType } from "../model/syncTypes";

export const executeSyncOperation = async (op: SyncType) => {
  switch (op.payload.op) {
    case "create_block":
      return await createBlockApi(
        op.payload.data.block,
        op.payload.note_id,
        op.payload.data.pos
      );

    case "delete_block":
      return await deleteBlockApi(
        op.payload.block_id,
        op.payload.note_id
      );

    case "change_block_type":
      return changeBlockTypeApi(
        op.payload.block_id,
        op.payload.note_id,
        op.payload.data.new_type
      );
      
    default:
      return await operationsApi(op.payload);
  }
};