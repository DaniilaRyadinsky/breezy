import { useActiveNoteStore } from "@/entities/note/model/store";

export const calculateTarget = (id: string, direction: 'up' | 'down') => {
  const blockOrder = useActiveNoteStore.getState().activeNote?.blockOrder ?? [];
  
  if (!blockOrder) return;
  const index = blockOrder.findIndex((b) => b === id);
  if (index === -1) return;

  const target =
    direction === 'up' ? blockOrder[index - 1] : blockOrder[index + 1];

  if (!target) return;

  return target;
};