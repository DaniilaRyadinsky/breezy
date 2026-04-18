// blockConversion.ts

import { BlockType, TextSegmentType, Block } from "../model/blockTypes";


// 1) Здесь задаем, во что КАЖДЫЙ тип можно превращать
export const ALLOWED_BLOCK_CONVERSIONS = {
  text: ["text", "header", "list", "quote", "code", "link"],
  header: ["header", "text", "list", "quote", "code", "link"],
  list: ["list", "text", "header", "quote", "code", "link"],
  quote: ["quote", "text", "header", "list", "code", "link"],
  code: ["code", "text", "quote"],
  link: ["link", "text", "quote"],
  img: ["img"],
  file: ["file"],
} as const satisfies Record<BlockType, readonly BlockType[]>;

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
  to: BlockType,
): boolean {
  const allowed = ALLOWED_BLOCK_CONVERSIONS[from] as readonly BlockType[];
  return allowed.includes(to);
}

export function getAvailableBlockTypes(from: BlockType): BlockType[] {
  return [...ALLOWED_BLOCK_CONVERSIONS[from]];
}

export function getPlainTextFromBlock(block: Block): string {
  switch (block.type) {
    case "text":
    case "header":
    case "list":
      return textSegmentsToString(block.data.text_data);

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
      return cloneTextSegments(block.data.text_data);

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
  newType: BlockType,
): Block | null {
  if (!canChangeBlockType(block.type, newType)) {
    return null;
  }

  if (block.type === newType) {
    return block;
  }

  const plainText = getPlainTextFromBlock(block);
  const textData = getTextSegmentsFromBlock(block);

  switch (newType) {
    case "text":
      return {
        id: block.id,
        pos: block.pos,
        type: "text",
        data: {
          text_data: textData,
        },
      };

    case "header":
      return {
        id: block.id,
        pos: block.pos,
        type: "header",
        data: {
          text_data: textData,
          level: block.type === "header" ? block.data.level : 1,
        },
      };

    case "list":
      return {
        id: block.id,
        pos: block.pos,
        type: "list",
        data: {
          text_data: textData,
          level: block.type === "list" ? block.data.level : 1,
          type: block.type === "list" ? block.data.type : "unordered",
          value: block.type === "list" ? block.data.value : 1,
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
    case "file":
      // в этой конфигурации сюда никогда не дойдем,
      // кроме случая если потом захочешь расширить ALLOWED_BLOCK_CONVERSIONS
      return null;
  }
}