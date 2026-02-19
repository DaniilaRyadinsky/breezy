
import { apiFetch } from "../../../../shared/api";
import { NoteInfo } from "../../types";

export const fetchNoteList = async () => {
  return apiFetch<NoteInfo[]>('note/all?start=0&end=4')
}