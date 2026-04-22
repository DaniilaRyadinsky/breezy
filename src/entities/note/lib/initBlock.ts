import { Block, BlockType, TextBlockType, TextSegmentType } from "../model/blockTypes";

export const initBlock = (type: BlockType): Block => {
  switch (type) {
    case "text":
      return {
        id: crypto.randomUUID(),
        type: "text",
        pos: 0,
        data: {
          text_data: {
            text: [{ style: "default", string: "" }],
          },
        },
      };

    case "header":
      return {
        id: crypto.randomUUID(),
        type: "header",
        pos: 0,
        data: {
          text_data: {
            text: [{ style: "default", string: "" }],
          },
          level: 1,
        },
      };

    case "list":
      return {
        id: crypto.randomUUID(),
        type: "list",
        pos: 0,
        data: {
          text_data: {
            text: [{ style: "default", string: "" }],
          },
          level: 1,
          type: "unordered",
          value: 1,
        },
      };

    default:
      return {
        id: crypto.randomUUID(),
        type,
        pos: 0,
      } as Block;
  }
};


const EMPTY_TEXT_SEGMENTS: TextSegmentType[] = [
  { style: "default", string: "" },
];

export const createEmptyTextBlock = (): TextBlockType => ({
  id: crypto.randomUUID(),
  type: "text",
  pos: 0,
  data: {
    text_data: {
      text: EMPTY_TEXT_SEGMENTS.map((seg) => ({ ...seg })),
    },
  },
});

export const createNextBlockFromBlock = (block: Block): Block | null => {
  switch (block.type) {
    case "text":
      return {
        id: crypto.randomUUID(),
        type: "text",
        pos: 0,
        data: {
          text_data: {
            text: EMPTY_TEXT_SEGMENTS.map((seg) => ({ ...seg })),
          },
        },
      };

    case "header":
      return {
        id: crypto.randomUUID(),
        type: "header",
        pos: 0,
        data: {
          text_data: {
            text: EMPTY_TEXT_SEGMENTS.map((seg) => ({ ...seg })),
          },
          level: block.data.level,
        },
      };

    case "list":
      return {
        id: crypto.randomUUID(),
        type: "list",
        pos: 0,
        data: {
          text_data: {
            text: EMPTY_TEXT_SEGMENTS.map((seg) => ({ ...seg })),
          },
          level: block.data.level,
          type: block.data.type,
          value:
            block.data.type === "ordered"
              ? block.data.value + 1
              : block.data.value,
        },
      };

    case "code":
      return null;

    case "img":
    case "link":
    case "file":
    case "quote":
      return createEmptyTextBlock();
  }
};