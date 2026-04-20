import { Block, BlockType, HeaderLevel, ListType } from "../model/blockTypes";

export type BlockChangeType =
  | Exclude<BlockType, "header" | "list">
  | `header_${HeaderLevel}`
  | ListType;

export type BlockChangeTarget =
  | { type: Exclude<BlockType, "header" | "list"> }
  | { type: "header"; level: HeaderLevel }
  | { type: "list"; listType: ListType };

export const toBlockChangeTarget = (
  value: BlockChangeType
): BlockChangeTarget => {
  switch (value) {
    case "header_1":
      return { type: "header", level: 1 };
    case "header_2":
      return { type: "header", level: 2 };
    case "header_3":
      return { type: "header", level: 3 };
    case "header_4":
      return { type: "header", level: 4 };

    case "ordered":
      return { type: "list", listType: "ordered" };
    case "unordered":
      return { type: "list", listType: "unordered" };
    case "todo":
      return { type: "list", listType: "todo" };

    case "text":
    case "quote":
    case "code":
    case "img":
    case "link":
    case "file":
      return { type: value };
  }
};

export const getBlockChangeTypeFromBlock = (
  block: Block
): BlockChangeType => {
  if (block.type === "header") {
    return `header_${block.data.level}`;
  }

  if (block.type === "list") {
    return block.data.type;
  }

  return block.type;
};