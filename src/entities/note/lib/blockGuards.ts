import { getSegmentsLength } from "@/features/NoteEditor/lib/documentRichText";
import { TextBlockType, HeaderBlockType, ListBlockType, Block, CodeBlockType, QuoteBlockType } from "../model/blockTypes";
import { BlockOperation } from "../model/operationsType";

type RichTextBlock = TextBlockType | HeaderBlockType | ListBlockType;


export function isRichTextBlock(block: Block): block is RichTextBlock {
  return (
    block.type === "text" ||
    block.type === "header" ||
    block.type === "list"
  );
}

export type PlainTextBlockType = CodeBlockType | QuoteBlockType

export const isPlainTextBlock = (
  block: Block
): block is PlainTextBlockType => {
  return (block.type === "code" || block.type === "quote")
}

export const getPlainText = (block: PlainTextBlockType): string => {
  switch (block.type) {
    case "code":
      return block.data.text
    case "quote":
      return block.data.text
  }
}

export const getBlockTextLength = (block: Block): number => {
  if (isRichTextBlock(block)) {
    return getSegmentsLength(block.data.text_data.text);
  }

  if (isPlainTextBlock(block)) {
    return block.data.text.length;
  }

  return 0;
};

export type PlainTextOperation = Extract<
  BlockOperation,
  { op: "insert_text" | "delete_range" }
>;

export type TextEditingOperation = Extract<
  BlockOperation,
  { op: "insert_text" | "delete_range" | "apply_style" }
>;

export const isPlainTextOperation = (
  op: BlockOperation
): op is PlainTextOperation => {
  return op.op === "insert_text" || op.op === "delete_range";
};

export const isTextEditingOperation = (
  op: BlockOperation
): op is TextEditingOperation => {
  return (
    op.op === "insert_text" ||
    op.op === "delete_range" ||
    op.op === "apply_style"
  );
};