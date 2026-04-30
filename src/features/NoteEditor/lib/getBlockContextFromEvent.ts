import { useActiveNoteStore } from "@/entities/note/model/store";
import { EditorSelection } from "./selection";

export const getBlockContextFromEvent = (
  root: HTMLElement,
  event: Event
) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) return null;

  const blockEl = target.closest<HTMLElement>("[data-block-id]");
  if (!blockEl) return null;

  if (!root.contains(blockEl)) return null;

  const blockId = blockEl.dataset.blockId;
  if (!blockId) return null;

  const note = useActiveNoteStore.getState().activeNote;
  if (!note) return null;

  const block = note.blocksById[blockId];
  if (!block) return null;

  const selection: EditorSelection = {
    start: {
      blockId,
      offset: 0,
    },
    end: {
      blockId,
      offset: 0,
    },
  };

  return {
    note,
    block,
    selection,
  };
};