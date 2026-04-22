import { Block, TextSegmentType } from "@/entities/note/model/blockTypes";
import { BlockOperation } from "@/entities/note/model/operationsType";
import { sliceSegments } from "./segmentsUtils";
import { isRichTextBlock } from "@/entities/note/lib/isRichTextBlock";
import { ActiveNote } from "@/entities/note/model/noteTypes";
import { getSegmentsLength } from "./documentRichText";


function cloneRichTextBlockWithText(
  block: Block,
  text: TextSegmentType[],
  options?: { incrementOrderedValue?: boolean }
): Block | null {
  if (!isRichTextBlock(block)) return null;

  switch (block.type) {
    case "text":
      return {
        id: crypto.randomUUID(),
        type: "text",
        pos: 0,
        data: {
          text_data: {
            text,
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
            text,
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
            text,
          },
          level: block.data.level,
          type: block.data.type,
          value:
            block.data.type === "ordered" && options?.incrementOrderedValue
              ? block.data.value + 1
              : block.data.value,
        },
      };

    default:
      return null;
  }
}

export function buildSplitBlockOperations(params: {
  noteId: string;
  note: ActiveNote;
  blockId: string;
  offset: number;
}): {
  operations: BlockOperation[];
  focusBlockId: string;
} | null {
  const { noteId, note, blockId, offset } = params;

  const block = note.blocksById[blockId];
  if (!block || !isRichTextBlock(block)) return null;

  const index = note.blockOrder.indexOf(blockId);
  if (index === -1) return null;

  const segments = block.data.text_data.text;
  const length = getSegmentsLength(segments);

  const safeOffset = Math.max(0, Math.min(offset, length));

  const leftText = sliceSegments(segments, 0, safeOffset);
  const rightText = sliceSegments(segments, safeOffset, length);

  const leftBlock = cloneRichTextBlockWithText(block, leftText);
  const rightBlock = cloneRichTextBlockWithText(block, rightText, {
    incrementOrderedValue: true,
  });

  if (!leftBlock || !rightBlock) return null;

  return {
    operations: [
      {
        op: "delete_block",
        note_id: noteId,
        block_id: blockId,
        data: {},
      },
      {
        op: "create_block",
        note_id: noteId,
        block_id: leftBlock.id,
        data: {
          block: leftBlock,
          pos: index,
        },
      },
      {
        op: "create_block",
        note_id: noteId,
        block_id: rightBlock.id,
        data: {
          block: rightBlock,
          pos: index + 1,
        },
      },
    ],
    focusBlockId: rightBlock.id,
  };
}