import { apiFetch } from "@/shared/api";
import { Block } from "../model/blockTypes";

export const createBlockApi = (block: Block, note_id: string, pos: number) => {
  return apiFetch<{id: string}>('block', {
    method: "POST",
    body: JSON.stringify({...block, note_id, pos})
  })
}


export const deleteBlockApi = (id: string, note_id: string) => {
  return apiFetch(`block?block_id=${id}&note_id=${note_id}`, {
    method: "DELETE",
  })
}