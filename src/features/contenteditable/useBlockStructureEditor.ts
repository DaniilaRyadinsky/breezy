import { useActiveNoteStore } from "@/entities/note/model/store";
import { RefObject, useEffect } from "react";
import { useBlocksRegistry } from "@/features/navigation";
import { getSingleBlockSelection } from "./lib/editorSelection";
import {
  applyDocumentOperations,
  deleteBlock,
  insertBlock,
} from "@/entities/note/model/storeOperations";
import { isRichTextBlock } from "@/entities/note/lib/isRichTextBlock";
import { getSegmentsLength } from "./lib/documentRichText";
import { createNextBlockFromBlock } from "@/entities/note/lib";
import { buildSplitBlockOperations } from "./lib/splitBuilder";

export const useBlockStructureEditor = (
  editorRef: RefObject<HTMLElement | null>
) => {
  const { focusBlock } = useBlocksRegistry();

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.isComposing) return;

      const selection = getSingleBlockSelection(root);
      if (!selection) return;

      const activeNote = useActiveNoteStore.getState().activeNote;
      if (!activeNote) return;

      const currentBlock = activeNote.blocksById[selection.blockId];
      if (!currentBlock) return;

      if (e.key === "Enter") {
        e.preventDefault();

        if (selection.start !== selection.end) {
          return;
        }

        if (currentBlock.type === "code") {
          return;
        }

        if (!isRichTextBlock(currentBlock)) {
          const nextBlock = createNextBlockFromBlock(currentBlock);
          if (!nextBlock) return;

          const newBlockId = insertBlock(nextBlock, currentBlock.id);
          if (newBlockId) {
            requestAnimationFrame(() => {
              focusBlock(newBlockId, "start");
            });
          }
          return;
        }

        const textLength = getSegmentsLength(currentBlock.data.text_data.text);

        if (selection.start === textLength) {
          const nextBlock = createNextBlockFromBlock(currentBlock);
          if (!nextBlock) return;

          const newBlockId = insertBlock(nextBlock, currentBlock.id);
          if (newBlockId) {
            requestAnimationFrame(() => {
              focusBlock(newBlockId, "start");
            });
          }
          return;
        }

        const splitResult = buildSplitBlockOperations({
          noteId: activeNote.id,
          note: activeNote,
          blockId: currentBlock.id,
          offset: selection.start,
        });

        if (!splitResult) return;

        applyDocumentOperations(activeNote.id, splitResult.operations);

        requestAnimationFrame(() => {
          focusBlock(splitResult.focusBlockId, "start");
        });

        return;
      }

      if (e.key === "Backspace") {
        if (selection.start !== selection.end) {
          return;
        }

        if (!isRichTextBlock(currentBlock)) {
          return;
        }

        const textLength = getSegmentsLength(currentBlock.data.text_data.text);

        if (textLength === 0) {
          e.preventDefault();

          const prevBlockId = await deleteBlock(currentBlock.id);
          if (prevBlockId) {
            requestAnimationFrame(() => {
              focusBlock(prevBlockId, "end");
            });
          }
        }
      }
    };

    root.addEventListener("keydown", handleKeyDown);
    return () => {
      root.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorRef, focusBlock]);
};