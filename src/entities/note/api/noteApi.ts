import { apiFetch } from "../../../shared/api";
import { Note, NoteInfo } from "../model/noteTypes";

export const createNoteApi = async (title: string) => {
  return apiFetch<{id: string}>(`note`, {
    method: "POST",
    body: JSON.stringify({ title })
  });
}

export const getNoteApi = async (id: string) => {
  return apiFetch<Note>(`note?id=${id}`, {
    method: "GET"
  })
}

type NoteListResponse = {
  items: NoteInfo[],
  total: number
}
export const getNoteList = async (start = 0, end = 10) => {
  return apiFetch<NoteListResponse>(`note/all?start=${start}&end=${end}`)
    .then((res) => res.items)
}

export const getNoteListByTag = async (id: string, start = 0, end = 10) => {
  return apiFetch<NoteListResponse>(`note/by-tag?id=${id}&start=${start}&end=${end}`)
    .then((res) => res.items)
}

export const patchTitleApi = async (title: string, note_id: string) => {
  return apiFetch<void>('note/title', {
    method: "PATCH",
    body: JSON.stringify({ title, note_id })
  })
}

