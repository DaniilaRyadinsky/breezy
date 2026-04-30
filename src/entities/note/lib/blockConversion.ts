import { BlockChangeType, toBlockChangeTarget } from "../model/blockChangeTypes";
import { BlockType, TextSegmentType, Block } from "../model/blockTypes";

export const ALLOWED_BLOCK_CONVERSIONS: Record<BlockType, readonly BlockType[]> = {
  text: ["text", "header", "list", "quote", "code", "link", "img", "file"],
  header: ["header", "text", "list", "quote", "code", "link"],
  list: ["list", "text", "header", "quote", "code", "link"],
  quote: ["quote", "text", "header", "list", "code", "link"],
  code: ["code", "text", "quote"],
  link: ["link", "text", "quote"],
  img: ["img"],
  file: ["file"],
};

function cloneTextSegments(segments: TextSegmentType[]): TextSegmentType[] {
  return segments.map((segment) => ({ ...segment }));
}

function stringToTextSegments(value: string): TextSegmentType[] {
  if (!value) return [];
  return [{ style: "default", string: value }];
}

function textSegmentsToString(segments: TextSegmentType[]): string {
  return segments.map((segment) => segment.string).join("");
}

export function canChangeBlockType(
  from: BlockType,
  to: BlockChangeType,
): boolean {
  const target = toBlockChangeTarget(to);
  return ALLOWED_BLOCK_CONVERSIONS[from].includes(target.type);
}

export function getAvailableBlockTypes(from: BlockType): BlockChangeType[] {
  return ALLOWED_BLOCK_CONVERSIONS[from].flatMap((type) => {
    if (type === "header") {
      return ["header_1", "header_2", "header_3", "header_4"] as const;
    }

    if (type === "list") {
      return ["unordered", "ordered", "todo"] as const;
    }

    return [type];
  });
}

export function getPlainTextFromBlock(block: Block): string {
  switch (block.type) {
    case "text":
    case "header":
    case "list":
      return textSegmentsToString(block.data.text_data.text);

    case "quote":
    case "code":
      return block.data.text;

    case "link":
      return block.data.text || block.data.url;

    case "img":
    case "file":
      return "";
  }
}

export function getTextSegmentsFromBlock(block: Block): TextSegmentType[] {
  switch (block.type) {
    case "text":
    case "header":
    case "list":
      return cloneTextSegments(block.data.text_data.text);

    case "quote":
    case "code":
      return stringToTextSegments(block.data.text);

    case "link":
      return stringToTextSegments(block.data.text || block.data.url);

    case "img":
    case "file":
      return [];
  }
}

export function convertBlockType(
  block: Block,
  newType: BlockChangeType,
): Block | null {
  if (!canChangeBlockType(block.type, newType)) {
    return null;
  }

  const target = toBlockChangeTarget(newType);

  if (
    block.type === target.type &&
    !(
      target.type === "header" &&
      block.type === "header" &&
      block.data.level !== target.level
    ) &&
    !(
      target.type === "list" &&
      block.type === "list" &&
      block.data.type !== target.listType
    )
  ) {
    return block;
  }

  const plainText = getPlainTextFromBlock(block);
  const textData = getTextSegmentsFromBlock(block);

  switch (target.type) {
    case "text":
      return {
        id: block.id,
        pos: block.pos,
        type: "text",
        data: {
          text_data: { text: textData },
        },
      };

    case "header":
      return {
        id: block.id,
        pos: block.pos,
        type: "header",
        data: {
          text_data: { text: textData },
          level: target.level,
        },
      };

    case "list":
      return {
        id: block.id,
        pos: block.pos,
        type: "list",
        data: {
          text_data: { text: textData },
          level: block.type === "list" ? block.data.level : 1,
          type: target.listType,
          value:
            target.listType === "ordered"
              ? block.type === "list" && block.data.type === "ordered"
                ? block.data.value
                : 1
              : 0,
        },
      };

    case "quote":
      return {
        id: block.id,
        pos: block.pos,
        type: "quote",
        data: {
          text: plainText,
        },
      };

    case "code":
      return {
        id: block.id,
        pos: block.pos,
        type: "code",
        data: {
          text: plainText,
          lang: block.type === "code" ? block.data.lang : "plaintext",
        },
      };

    case "link":
      return {
        id: block.id,
        pos: block.pos,
        type: "link",
        data: {
          text: plainText || "Ссылка",
          url: block.type === "link" ? block.data.url : "",
        },
      };

    case "img":
      return {
        id: block.id,
        pos: block.pos,
        type: "img",
        data: {
          alt: "",
          src: "",
        },
      };
    case "file":
      return {
        id: block.id,
        pos: block.pos,
        type: "file",
        data: {
          src: "",
        },
      };
  }
}