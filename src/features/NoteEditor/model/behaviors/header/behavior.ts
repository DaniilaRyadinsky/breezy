import { HeaderBlockType, RichTextBlock } from "@/entities/note/model/blockTypes";
import { BlockBehavior, BlockBehaviorContext } from "../types";
import { richTextBaseBehavior } from "../behaviors";

export const headerBehavior: BlockBehavior<HeaderBlockType> = { 
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
        ctx as BlockBehaviorContext<  RichTextBlock, KeyboardEvent>
      ) ?? false;
    },
}