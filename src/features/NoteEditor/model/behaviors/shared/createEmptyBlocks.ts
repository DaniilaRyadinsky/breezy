import { TextBlockType } from "@/entities/note/model/blockTypes";

export const createEmptyTextBlock = (pos: number): TextBlockType => {
  return {
    id: crypto.randomUUID(),
    type: "text",
    pos,
    data: {
      text_data: {
        text: [{ style: "default", string: "" }],
      },
    },
  };
};