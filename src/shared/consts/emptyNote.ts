import { ActiveNote } from "@/entities/note/model/noteTypes";

export const EMPTY_NOTE: ActiveNote = {
  id: '',
  title: '',
  blockOrder: [],
  blocksById: {},
}
