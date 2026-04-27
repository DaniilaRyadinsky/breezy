import { Block, RichTextBlock, TextSegmentType } from "@/entities/note/model/blockTypes";

  
export const EMPTY_SEGMENT: TextSegmentType = {
  style: "default",
  string: "",
};

export const normalizeTextData = <T extends RichTextBlock>(block: T): T => {
  const text = block.data.text_data?.text;

  if (Array.isArray(text) && text.length > 0) {
    return block;
  }

  return {
    ...block,
    data: {
      ...block.data,
      text_data: {
        text: [{ ...EMPTY_SEGMENT }],
      },
    },
  };
};


export const normalizeBlockTextData = (block: Block): Block => {
  switch (block.type) {
    case "text":
    case "list":
    case "header":
      return normalizeTextData(block);

    default:
      return block;
  }
};