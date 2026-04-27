
import { BlockBehavior, BlockBehaviorContext } from "../types";
import { RichTextBlock, TextBlockType } from "@/entities/note/model/blockTypes";
import { richTextBaseBehavior } from "../behaviors";

export const textBehavior: BlockBehavior<TextBlockType> = {
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
    return richTextBaseBehavior.onKeyDown?.(
      ctx as BlockBehaviorContext<RichTextBlock, KeyboardEvent>
    ) ?? false;
  },
};


