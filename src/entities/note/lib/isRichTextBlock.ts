import { Block, HeaderBlockType, ListBlockType, TextBlockType } from "../model/blockTypes";

type RichTextBlock = TextBlockType | HeaderBlockType | ListBlockType;


export function isRichTextBlock(block: Block): block is RichTextBlock {
  return (
    block.type === "text" ||
    block.type === "header" ||
    block.type === "list"
  );
}