import { ImgBlockType } from "@/entities/note/model/blockTypes";
import { createEmptyTextBlock } from "../shared/createEmptyTextBlock";
import { BlockBehavior } from "../types";

export const imageBehavior: BlockBehavior<ImgBlockType> = {
  onKeyDown(ctx) {
    const event = ctx.event as KeyboardEvent;
    const { note, block, commitOperations } = ctx;

    console.log("img block keydown");

    if (event.isComposing) return false;

    const currentIndex = note.blockOrder.indexOf(block.id);
    if (currentIndex === -1) return false;

    if (event.key === "Enter") {
      event.preventDefault();

      const newBlock = createEmptyTextBlock(currentIndex + 1);

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

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();

      ctx.commitOperations(
          [
            {
              op: "change_block_type",
              note_id: ctx.note.id,
              block_id: ctx.block.id,
              data: {
                new_type: "text",
              },
            },
          ],
          {
            start: {
              blockId: ctx.block.id,
              offset: ctx.selection.start.offset,
            },
            end: {
              blockId: ctx.block.id,
              offset: ctx.selection.start.offset,
            },
          }
        );

      return true;
    }

    return false;
  },
};