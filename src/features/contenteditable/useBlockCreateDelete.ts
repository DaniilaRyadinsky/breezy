import { BlockType } from "@/entities/note/model/blockTypes";
import { getCaretOffsetInElement } from "@/shared/lib/utils";
import { useCallback } from "react";

export const useBlockCreateDelete = (
  id: string,
  blockType: BlockType,
  editableRef: React.RefObject<HTMLElement | null>,
  createBlock: (type: BlockType, afterId: string) => void,
  deleteBlock: (id: string) => void,
) => {

  const onEnterDown = useCallback((
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const el = editableRef.current;
    if (!el) return;

    const offset = getCaretOffsetInElement(el);
    const textLength = el.textContent?.length ?? 0;

    if (offset === textLength) {
      createBlock(blockType, id);
    }
    else {
      console.log("split блока");
    }
  }, [editableRef, createBlock, blockType, id]);

  const onBackspaceDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = editableRef.current;
    if (!el) return;

    const textLength = el.textContent?.length ?? 0;

    if (!textLength) {
      e.preventDefault();
      deleteBlock(id);
    }
  }, [editableRef, deleteBlock, id]);

  return {
    onEnterDown,
    onBackspaceDown
  }
}