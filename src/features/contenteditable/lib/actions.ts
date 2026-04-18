import { BlockType } from "@/entities/note/model/blockTypes";

type EnterAction =
  | { type: "create_after"; blockType: BlockType; afterId: string }
  | { type: "split"; blockId: string; offset: number }
  | { type: "none" };

type BackspaceAction =
  | { type: "delete_block"; blockId: string }
  | { type: "none" };

export function resolveEnterAction(params: {
  blockId: string;
  blockType: BlockType;
  caretOffset: number | null;
  textLength: number;
}): EnterAction {
  const { blockId, blockType, caretOffset, textLength } = params;

  if (caretOffset === null) {
    return { type: "none" };
  }

  if (caretOffset === textLength) {
    return {
      type: "create_after",
      blockType,
      afterId: blockId,
    };
  }

  return {
    type: "split",
    blockId,
    offset: caretOffset,
  };
}

export function resolveBackspaceAction(params: {
  blockId: string;
  textLength: number;
}): BackspaceAction {
  const { blockId, textLength } = params;

  if (textLength === 0) {
    return {
      type: "delete_block",
      blockId,
    };
  }

  return { type: "none" };
}