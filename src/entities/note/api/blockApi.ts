import { apiFetch } from "@/shared/api";
import { Block } from "../model/blockTypes";
import { BlockOperation } from "../model/operationsType";

export const createBlockApi = (block: Block, note_id: string, pos: number) => {
  return apiFetch<{id: string}>('block', {
    method: "POST",
    body: JSON.stringify({...block, new_id: block.id, note_id, pos})
  })
}

export const deleteBlockApi = (id: string, note_id: string) => {
  return apiFetch(`block?block_id=${id}&note_id=${note_id}`, {
    method: "DELETE",
  })
}

export const changeBlockTypeApi = (block_id: string, note_id: string, new_type: string) => {
  return apiFetch<{id: string}>('block/type', {
    method: "PATCH",
    body: JSON.stringify({block_id, note_id, new_type})
  })
}

export const operationsApi = (operations: BlockOperation) => {
  return apiFetch('block/op', {
    method: "POST",
    body: JSON.stringify(operations)
  })
}