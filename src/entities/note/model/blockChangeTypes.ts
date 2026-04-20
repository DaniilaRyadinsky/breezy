import { HeaderLevel, ListType } from "./blockTypes";

export type BlockChangeType =
  | "text"
  | "quote"
  | "code"
  | "img"
  | "link"
  | "file"
  | `header_${HeaderLevel}`
  | ListType;

export type BlockChangeTarget =
  | { type: "text" }
  | { type: "quote" }
  | { type: "code" }
  | { type: "img" }
  | { type: "link" }
  | { type: "file" }
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