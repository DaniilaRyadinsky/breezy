import {
  Block,
  HeaderBlockType,
  ListBlockType,
  TextBlockType,
  TextSegmentType,
  TextStyle,
} from "@/entities/note/model/blockTypes";
import { BlockOperation } from "@/entities/note/model/operationsType";
import {
  EditorSelection,
  normalizeEditorSelection,
} from "./editorSelection";
import { sliceSegments } from "./segmentsUtils";

type RichTextBlock = TextBlockType | HeaderBlockType | ListBlockType;

type EditorNote = {
  id: string;
  blockOrder: string[];
  blocksById: Record<string, Block>;
};

export function isRichTextBlock(block: Block): block is RichTextBlock {
  return (
    block.type === "text" ||
    block.type === "header" ||
    block.type === "list"
  );
}

export function getBlockSegments(block: RichTextBlock): TextSegmentType[] {
  switch (block.type) {
    case "text":
      return block.data.text;
    case "header":
      return block.data.text_data;
    case "list":
      return block.data.text_data;
  }
}

export function getSegmentsLength(segments: TextSegmentType[]): number {
  return segments.reduce((sum, seg) => sum + seg.string.length, 0);
}

function segmentsToPlainText(segments: TextSegmentType[]): string {
  return segments.map((seg) => seg.string).join("");
}

export function buildDeleteSelectionOperations(params: {
  noteId: string;
  note: EditorNote;
  selection: EditorSelection;
}) {
  const { noteId, note } = params;
  const selection = normalizeEditorSelection(params.selection, note.blockOrder);

  const startIndex = note.blockOrder.indexOf(selection.start.blockId);
  const endIndex = note.blockOrder.indexOf(selection.end.blockId);

  if (startIndex === -1 || endIndex === -1) return null;

  const startBlock = note.blocksById[selection.start.blockId];
  const endBlock = note.blocksById[selection.end.blockId];

  if (!startBlock || !endBlock) return null;
  if (!isRichTextBlock(startBlock) || !isRichTextBlock(endBlock)) return null;

  const ops: BlockOperation[] = [];

  if (
    startIndex === endIndex &&
    selection.start.offset === selection.end.offset
  ) {
    return {
      operations: [],
      nextSelection: {
        start: selection.start,
        end: selection.start,
      },
    };
  }

  if (startIndex === endIndex) {
    ops.push({
      op: "delete_range",
      note_id: noteId,
      block_id: selection.start.blockId,
      data: {
        start: selection.start.offset,
        end: selection.end.offset,
      },
    });

    return {
      operations: ops,
      nextSelection: {
        start: selection.start,
        end: selection.start,
      },
    };
  }

  const startSegments = getBlockSegments(startBlock);
  const endSegments = getBlockSegments(endBlock);

  const startLength = getSegmentsLength(startSegments);
  const endLength = getSegmentsLength(endSegments);

  const suffixSegments = sliceSegments(
    endSegments,
    selection.end.offset,
    endLength
  );

  const suffixText = segmentsToPlainText(suffixSegments);

  ops.push({
    op: "delete_range",
    note_id: noteId,
    block_id: selection.start.blockId,
    data: {
      start: selection.start.offset,
      end: startLength,
    },
  });

  if (suffixText.length > 0) {
    ops.push({
      op: "insert_text",
      note_id: noteId,
      block_id: selection.start.blockId,
      data: {
        pos: selection.start.offset,
        new_text: suffixText,
      },
    });

    let cursor = selection.start.offset;

    for (const seg of suffixSegments) {
      if (!seg.string.length) continue;

      ops.push({
        op: "apply_style",
        note_id: noteId,
        block_id: selection.start.blockId,
        data: {
          start: cursor,
          end: cursor + seg.string.length,
          style: seg.style,
        },
      });

      cursor += seg.string.length;
    }
  }

  for (let i = startIndex + 1; i <= endIndex; i++) {
    const blockId = note.blockOrder[i];

    ops.push({
      op: "delete_block",
      note_id: noteId,
      block_id: blockId,
      data: {},
    });
  }

  return {
    operations: ops,
    nextSelection: {
      start: selection.start,
      end: selection.start,
    },
  };
}

export function buildApplyStyleOperations(params: {
  noteId: string;
  note: EditorNote;
  selection: EditorSelection;
  style: TextStyle;
}): {
  operations: BlockOperation[];
  nextSelection: EditorSelection;
} | null {
  const { noteId, note, style } = params;
  const selection = normalizeEditorSelection(params.selection, note.blockOrder);

  const startIndex = note.blockOrder.indexOf(selection.start.blockId);
  const endIndex = note.blockOrder.indexOf(selection.end.blockId);

  if (startIndex === -1 || endIndex === -1) return null;

  const ops: BlockOperation[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    const blockId = note.blockOrder[i];
    const block = note.blocksById[blockId];

    if (!block || !isRichTextBlock(block)) continue;

    const len = getSegmentsLength(getBlockSegments(block));

    const start = i === startIndex ? selection.start.offset : 0;
    const end = i === endIndex ? selection.end.offset : len;

    if (start >= end) continue;

    ops.push({
      op: "apply_style",
      note_id: noteId,
      block_id: blockId,
      data: { start, end, style },
    });
  }

  return {
    operations: ops,
    nextSelection: selection,
  };
}