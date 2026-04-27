import { isPlainTextBlock, isRichTextBlock } from "@/entities/note/lib/blockGuards";
import { EditableTextBlock } from "@/entities/note/model/blockTypes";

import { useActiveNoteStore } from "@/entities/note/model/store";
import { getEditorSelection, normalizeEditorSelection } from "./editorSelection";

export const getEditableTextContext = (root: HTMLElement) => {
  const note = useActiveNoteStore.getState().activeNote;
  if (!note) return null;

  const selection = getEditorSelection(root);
  if (!selection) return null;

  const normalized = normalizeEditorSelection(selection, note.blockOrder);
  if (normalized.start.blockId !== normalized.end.blockId) return null;

  const block = note.blocksById[normalized.start.blockId];
  if (!block) return null;

  if (!isRichTextBlock(block) && !isPlainTextBlock(block)) {
    return null;
  }

  return {
    note,
    block: block as EditableTextBlock,
    selection: normalized,
  };
};