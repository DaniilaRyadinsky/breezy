import { isRichTextBlock } from "@/entities/note/lib/blockGuards";
import { Block, RichTextBlock, TextSegmentType, TextStyle } from "@/entities/note/model/blockTypes";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { EditorSelection, getEditorSelection, isCollapsedEditorSelection, normalizeEditorSelection } from "./editorSelection";
import { ActiveNote } from "@/entities/note/model/noteTypes";
import { BlockOperation } from "@/entities/note/model/operationsType";
import { sliceSegments } from "./segmentsUtils";

export function getSegmentsLength(segments: TextSegmentType[]): number {
  return segments.reduce((sum, seg) => sum + seg.string.length, 0);
}

export const getRichTextContext = (root: HTMLElement) => {
  const note = useActiveNoteStore.getState().activeNote;
  if (!note) return null;

  const selection = getEditorSelection(root);
  if (!selection) return null;

  const normalized = normalizeEditorSelection(selection, note.blockOrder);
  if (normalized.start.blockId !== normalized.end.blockId) return null;

  const block = note.blocksById[normalized.start.blockId];
  if (!block || !isRichTextBlock(block)) return null;

  return {
    note,
    block,
    selection: normalized,
  };
};


export const buildApplyStyleOperationsForRichBlocks = ({
  note,
  selection,
  style,
}: {
  note: ActiveNote;
  selection: EditorSelection;
  style: TextStyle;
}): { operations: BlockOperation[]; nextSelection: EditorSelection } | null => {
  if (isCollapsedEditorSelection(selection)) return null;

  const startIndex = note.blockOrder.indexOf(selection.start.blockId);
  const endIndex = note.blockOrder.indexOf(selection.end.blockId);

  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return null;
  }

  const operations: BlockOperation[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    const blockId = note.blockOrder[i];
    const block = note.blocksById[blockId];
    if (!block || !isRichTextBlock(block)) continue;

    const fullLength = getSegmentsLength(block.data.text_data.text);

    let start = 0;
    let end = fullLength;

    if (blockId === selection.start.blockId) {
      start = selection.start.offset;
    }

    if (blockId === selection.end.blockId) {
      end = selection.end.offset;
    }

    if (start >= end) continue;

    operations.push({
      op: "apply_style",
      note_id: note.id,
      block_id: blockId,
      block_type: block.type,
      data: {
        start,
        end,
        style,
      },
    });
  }

  if (!operations.length) return null;

  return {
    operations,
    nextSelection: selection,
  };
};


type EditorNote = {
  id: string;
  blockOrder: string[];
  blocksById: Record<string, Block>;
};


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
      block_type: startBlock.type,
    });

    return {
      operations: ops,
      nextSelection: {
        start: selection.start,
        end: selection.start,
      },
    };
  }

  const startSegments = startBlock.data.text_data.text;
  const endSegments = endBlock.data.text_data.text;

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
    block_type: startBlock.type,  
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
      block_type: startBlock.type,
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
        block_type: startBlock.type,
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

    const len = getSegmentsLength(block.data.text_data.text);

    const start = i === startIndex ? selection.start.offset : 0;
    const end = i === endIndex ? selection.end.offset : len;

    if (start >= end) continue;

    ops.push({
      op: "apply_style",
      note_id: noteId,
      block_id: blockId,
      data: { start, end, style },
      block_type: block.type,
    });
  }

  return {
    operations: ops,
    nextSelection: selection,
  };
}

export const createRichTextBlockCopy = (
  block: RichTextBlock,
  pos: number,
  text: TextSegmentType[]
): RichTextBlock => {
  return {
    ...block,
    id: crypto.randomUUID(),
    pos,
    data: {
      ...block.data,
      text_data: {
        text,
      },
    },
  } as RichTextBlock;
};