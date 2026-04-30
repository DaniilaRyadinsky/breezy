import { Block, RichTextBlock } from "@/entities/note/model/blockTypes";
import { BlockOperation } from "@/entities/note/model/operationsType";
import { buildDeleteSelectionOperations, createRichTextBlockCopy, getSegmentsLength } from "../../lib/documentRichText";
import { isCollapsedEditorSelection } from "../../lib/selection";
import { BlockBehavior, BlockBehaviorContext } from "./types";
import { splitSegments } from "../../lib/segmentsUtils";

const getSelectionOffsetForBlockEnd = (block: Block) => {
   switch (block.type) {
    case "text":
    case "header":
    case "list":
      return getSegmentsLength(block.data?.text_data?.text ?? []);

    default:
      return 0;
  }
};

const buildInsertTextOps = (
  noteId: string,
  block: RichTextBlock,
  selectionStartOffset: number,
  text: string
): {
  operations: BlockOperation[];
  nextOffset: number;
} => {
  return {
    operations: [
      {
        op: "insert_text",
        note_id: noteId,
        block_id: block.id,
        block_type: block.type,
        data: {
          pos: selectionStartOffset,
          new_text: text,
        },
      },
    ],
    nextOffset: selectionStartOffset + text.length,
  };
};

const buildDeleteBackwardOp = (
  noteId: string,
  block: RichTextBlock,
  offset: number
): BlockOperation => {
  return {
    op: "delete_range",
    note_id: noteId,
    block_id: block.id,
    block_type: block.type,
    data: {
      start: offset - 1,
      end: offset,
    },
  };
};

const buildDeleteForwardOp = (
  noteId: string,
  block: RichTextBlock,
  offset: number
): BlockOperation => {
  return {
    op: "delete_range",
    note_id: noteId,
    block_id: block.id,
    block_type: block.type,
    data: {
      start: offset,
      end: offset + 1,
    },
  };
};

const getBlockTextLength = (block: RichTextBlock) => {
  return getSegmentsLength(block.data.text_data.text);
};

const deleteEmptyBlockBackward = (
  ctx: BlockBehaviorContext<RichTextBlock, InputEvent>
) => {
  const { note, block, commitOperations } = ctx;

  const currentIndex = note.blockOrder.indexOf(block.id);
  if (currentIndex === -1) return true;

  if (note.blockOrder.length <= 1) {
    return true;
  }

  const previousBlockId = note.blockOrder[currentIndex - 1];
  const nextBlockId = note.blockOrder[currentIndex + 1];

  const selectionTargetId = previousBlockId ?? nextBlockId;
  if (!selectionTargetId) return true;

  const selectionTarget = note.blocksById[selectionTargetId];
  if (!selectionTarget) return true;

  const nextOffset = previousBlockId
    ? getSelectionOffsetForBlockEnd(selectionTarget)
    : 0;

  commitOperations(
    [
      {
        op: "delete_block",
        note_id: note.id,
        block_id: block.id,
        data: {},
      },
    ],
    {
      start: {
        blockId: selectionTarget.id,
        offset: nextOffset,
      },
      end: {
        blockId: selectionTarget.id,
        offset: nextOffset,
      },
    }
  );

  return true;
};

const deleteEmptyBlockForward = (
  ctx: BlockBehaviorContext<RichTextBlock, InputEvent>
) => {
  const { note, block, commitOperations } = ctx;

  const currentIndex = note.blockOrder.indexOf(block.id);
  if (currentIndex === -1) return true;

  if (note.blockOrder.length <= 1) {
    return true;
  }

  const nextBlockId = note.blockOrder[currentIndex + 1];
  const previousBlockId = note.blockOrder[currentIndex - 1];

  const selectionTargetId = nextBlockId ?? previousBlockId;
  if (!selectionTargetId) return true;

  const selectionTarget = note.blocksById[selectionTargetId];
  if (!selectionTarget) return true;

  const nextOffset = nextBlockId
    ? 0
    : getSelectionOffsetForBlockEnd(selectionTarget);

  commitOperations(
    [
      {
        op: "delete_block",
        note_id: note.id,
        block_id: block.id,
        data: {},
      },
    ],
    {
      start: {
        blockId: selectionTarget.id,
        offset: nextOffset,
      },
      end: {
        blockId: selectionTarget.id,
        offset: nextOffset,
      },
    }
  );

  return true;
};

export const richTextBaseBehavior: BlockBehavior<RichTextBlock> = {
  onBeforeInput(ctx) {
    const { event, note, block, selection, commitOperations, deleteSelection } = ctx;

    if (event.isComposing) return false;

    const isCollapsed = isCollapsedEditorSelection(selection);

    switch (event.inputType) {
      case "insertText": {
        const text = event.data ?? "";
        if (!text) return true;

        event.preventDefault();

        const ops: BlockOperation[] = [];
        let insertOffset = selection.start.offset;

        if (!isCollapsed) {
          const deleteResult = buildDeleteSelectionOperations({
            noteId: note.id,
            note,
            selection,
          });

          if (!deleteResult) return true;

          ops.push(...deleteResult.operations);
          insertOffset = deleteResult.nextSelection.start.offset;
        }

        const insertResult = buildInsertTextOps(
          note.id,
          block,
          insertOffset,
          text
        );

        ops.push(...insertResult.operations);

        commitOperations(ops, {
          start: {
            blockId: block.id,
            offset: insertResult.nextOffset,
          },
          end: {
            blockId: block.id,
            offset: insertResult.nextOffset,
          },
        });

        return true;
      }

      case "deleteByCut":
      case "deleteContentBackward":
      case "deleteContentForward": {
        if (!isCollapsed) {
          event.preventDefault();
          deleteSelection(note, selection);
          return true;
        }

        if (event.inputType === "deleteContentBackward") {
          const fullTextLength = getBlockTextLength(block);

          if (fullTextLength === 0) {
            event.preventDefault();

            return deleteEmptyBlockBackward(
              ctx as BlockBehaviorContext<RichTextBlock, InputEvent>
            );
          }

          if (selection.start.offset === 0) {
            event.preventDefault();
            return true;
          }

          event.preventDefault();

          commitOperations(
            [
              buildDeleteBackwardOp(
                note.id,
                block,
                selection.start.offset
              ),
            ],
            {
              start: {
                blockId: block.id,
                offset: selection.start.offset - 1,
              },
              end: {
                blockId: block.id,
                offset: selection.start.offset - 1,
              },
            }
          );

          return true;
        }

        if (event.inputType === "deleteContentForward") {
          const fullTextLength = getBlockTextLength(block);

          if (fullTextLength === 0) {
            event.preventDefault();

            return deleteEmptyBlockForward(
              ctx as BlockBehaviorContext<RichTextBlock, InputEvent>
            );
          }

          if (selection.start.offset >= fullTextLength) {
            event.preventDefault();
            return true;
          }

          event.preventDefault();

          commitOperations(
            [
              buildDeleteForwardOp(
                note.id,
                block,
                selection.start.offset
              ),
            ],
            {
              start: {
                blockId: block.id,
                offset: selection.start.offset,
              },
              end: {
                blockId: block.id,
                offset: selection.start.offset,
              },
            }
          );

          return true;
        }

        return true;
      }

      default:
        return false;
    }
  },

  onKeyDown(ctx) {
    const event = ctx.event as KeyboardEvent;
    const { note, selection, deleteSelection } = ctx;

    if (event.isComposing) return false;

    if (event.key === "Enter") {
      return createBlockAfterOrSplit(
        ctx as BlockBehaviorContext<RichTextBlock, KeyboardEvent>
      );
    }

    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      !isCollapsedEditorSelection(selection)
    ) {
      event.preventDefault();
      deleteSelection(note, selection);
      return true;
    }

    return false;
  },

  onPaste(ctx) {
    const event = ctx.event as ClipboardEvent;
    const { note, block, selection, commitOperations } = ctx;
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (!text) return false;

    event.preventDefault();

    const isCollapsed = isCollapsedEditorSelection(selection);
    const ops: BlockOperation[] = [];
    let insertOffset = selection.start.offset;

    if (!isCollapsed) {
      const deleteResult = buildDeleteSelectionOperations({
        noteId: note.id,
        note,
        selection,
      });

      if (!deleteResult) return true;

      ops.push(...deleteResult.operations);
      insertOffset = deleteResult.nextSelection.start.offset;
    }

    const insertResult = buildInsertTextOps(
      note.id,
      block,
      insertOffset,
      text
    );

    ops.push(...insertResult.operations);

    commitOperations(ops, {
      start: {
        blockId: block.id,
        offset: insertResult.nextOffset,
      },
      end: {
        blockId: block.id,
        offset: insertResult.nextOffset,
      },
    });

    return true;
  },

};


const createBlockAfterOrSplit = (
  ctx: BlockBehaviorContext<RichTextBlock, KeyboardEvent>
) => {
  const { event, note, block, selection, commitOperations } = ctx;

  if (!isCollapsedEditorSelection(selection)) {
    event.preventDefault();
    ctx.deleteSelection(note, selection);
    return true;
  }

  const currentIndex = note.blockOrder.indexOf(block.id);
  if (currentIndex === -1) return true;

  const offset = selection.start.offset;
  const textLength = getSegmentsLength(block.data.text_data.text);

  event.preventDefault();

  if (offset === textLength) {
    const newBlock = createRichTextBlockCopy(
      block,
      currentIndex + 1,
      []
    );

    commitOperations(
      [
        {
          op: "create_block",
          note_id: note.id,
          block_id: newBlock.id,
          data: {
            block: newBlock,
            pos: currentIndex + 1,
          },
        },
      ],
      {
        start: {
          blockId: newBlock.id,
          offset: 0,
        },
        end: {
          blockId: newBlock.id,
          offset: 0,
        },
      }
    );

    return true;
  }

  const { right } = splitSegments(
    block.data.text_data.text,
    offset
  );

  const rightBlock = createRichTextBlockCopy(
    block,
    currentIndex + 1,
    right
  );

  commitOperations(
    [
      {
        op: "delete_range",
        note_id: note.id,
        block_id: block.id,
        block_type: block.type,
        data: {
          start: offset,
          end: textLength,
        },
      },
      {
        op: "create_block",
        note_id: note.id,
        block_id: rightBlock.id,
        data: {
          block: rightBlock,
          pos: currentIndex + 1,
        },
      },
    ],
    {
      start: {
        blockId: rightBlock.id,
        offset: 0,
      },
      end: {
        blockId: rightBlock.id,
        offset: 0,
      },
    }
  );

  return true;
};