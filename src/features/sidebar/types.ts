import { TagColor } from "./ui/Tag";

export type NoteInfo = {
  id: string,
  name: string,
  description: string,
  date_changed: string,
  tag_color: TagColor| null,
  tag_text: string,
  // isSelected: boolean,
}

