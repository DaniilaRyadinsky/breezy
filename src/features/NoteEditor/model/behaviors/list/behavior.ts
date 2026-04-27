import { ListBlockType, ListLevel, RichTextBlock } from "@/entities/note/model/blockTypes";
import { BlockBehavior, BlockBehaviorContext } from "../types";
import { richTextBaseBehavior } from "../behaviors";
import { isCollapsedEditorSelection } from "@/features/NoteEditor/lib/selection";

export const listBehavior: BlockBehavior<ListBlockType> = { 
  
    onBeforeInput(ctx) {
      return richTextBaseBehavior.onBeforeInput?.(
        ctx as BlockBehaviorContext<RichTextBlock, InputEvent>
      ) ?? false;
    },
  
    onPaste(ctx) {
      return richTextBaseBehavior.onPaste?.(
        ctx as BlockBehaviorContext<RichTextBlock, ClipboardEvent>
      ) ?? false;
    },
  
    onKeyDown(ctx) {
      const event = ctx.event as KeyboardEvent;

    if (event.isComposing) return false;

    const isCollapsed = isCollapsedEditorSelection(ctx.selection);
    const isAtStart = ctx.selection.start.offset === 0;

    if (
      event.key === "Backspace" &&
      isCollapsed &&
      isAtStart &&
      ctx.block.data.level > 1
    ) {
      event.preventDefault();

      const newLevel = (ctx.block.data.level - 1) as ListLevel;

      ctx.commitOperations(
        [
          {
            op: "change_level",
            note_id: ctx.note.id,
            block_id: ctx.block.id,
            data: {
              new_level: newLevel,
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

    if (
      event.key === "Tab" &&
      isCollapsed &&
      ctx.block.data.level < 4
    ) {
      event.preventDefault();

      const newLevel = (ctx.block.data.level + 1) as ListLevel;

      ctx.commitOperations(
        [
          {
            op: "change_level",
            note_id: ctx.note.id,
            block_id: ctx.block.id,
            data: {
              new_level: newLevel,
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
      return richTextBaseBehavior.onKeyDown?.(
        ctx as BlockBehaviorContext<RichTextBlock, KeyboardEvent>
      ) ?? false;
    },
}