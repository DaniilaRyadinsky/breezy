import { useActiveNoteStore } from "@/entities/note/model/store";


export const getBlockContextFromElement = (
  root: HTMLElement,
  element: HTMLElement
) => {
  const blockEl = element.closest<HTMLElement>("[data-block-id]");
  if (!blockEl) return null;

  if (!root.contains(blockEl)) return null;

  const blockId = blockEl.dataset.blockId;
  if (!blockId) return null;

  const note = useActiveNoteStore.getState().activeNote;
  if (!note) return null;

  const block = note.blocksById[blockId];
  if (!block) return null;

  return {
    note,
    block,
    selection: {
      start: {
        blockId,
        offset: 0,
      },
      end: {
        blockId,
        offset: 0,
      },
    },
  };
};

export const getBlockContextFromEvent = (
  root: HTMLElement,
  event: Event
) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) return null;

  return getBlockContextFromElement(root, target);
};