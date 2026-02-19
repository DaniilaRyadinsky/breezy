import { apiFetch } from "../../../shared/api"

export const cleanTrash = async() => {
  return apiFetch('trash', {
    method: "DELETE"
  });
}

export const getTrashList = async() => {
  return apiFetch('trash', {
    method: "GET"
  });
}

export const moveToTrash = async(note_id: string) => {
  return apiFetch(`trash/to?id=${note_id}`, {
    method: "RUT"
  });
}

export const moveFromTrash = async(note_id: string) => {
  return apiFetch(`trash/from?id=${note_id}`, {
    method: "RUT"
  });
}