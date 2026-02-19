import { NoteInfo } from "../../../features/sidebar/types";
import { apiFetch } from "../../../shared/api";

export const createNote = async (title: string) => {
  return apiFetch(`note`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
}

export const getNote = async (id: string) => {
  return apiFetch(`note?id=${id}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  })
}

export const fetchNoteList = async () => {
  return apiFetch<NoteInfo[]>('note/all?start=0&end=4')
}

export const fetchNoteListByTag = async () => {
  return apiFetch<NoteInfo[]>('note/all?start=0&end=4')
}

export const patchTitle = async () => {

}