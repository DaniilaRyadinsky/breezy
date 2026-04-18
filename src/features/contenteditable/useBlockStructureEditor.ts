import { useActiveNoteStore } from "@/entities/note/model/store";
import { RefObject, useEffect } from "react";
import { useBlocksRegistry } from "@/features/navigation";
import { getSingleBlockSelection } from "./lib/editorSelection";
import { deleteBlock, insertBlock } from "@/entities/note/model/storeOperations";

export const useBlockStructureEditor = (
  editorRef: RefObject<HTMLElement | null>,
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

        const textLength = selection.blockEl.textContent?.length ?? 0;

        if (selection.start === textLength) {
          const newBlockId = await insertBlock(
            currentBlock.type,
            currentBlock.id
          );

          if (newBlockId) {
            requestAnimationFrame(() => {
              focusBlock(newBlockId, "start");
            });
          }

          return;
        }

        // TODO: split block
        return;
      }

      if (e.key === "Backspace") {
        if (selection.start !== selection.end) {
          return;
        }

        const textLength = selection.blockEl.textContent?.length ?? 0;

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