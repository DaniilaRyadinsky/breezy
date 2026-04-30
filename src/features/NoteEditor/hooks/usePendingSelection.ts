import { useRef, useLayoutEffect, RefObject } from "react";
import { PendingEditorSelection, setEditorSelection } from "../lib/selection";
import { useActiveNoteStore } from "@/entities/note/model/store";

export type UsePendingSelectionResult = {
  pendingSelectionRef: React.MutableRefObject<PendingEditorSelection | null>;
  setPendingSelection: (selection: PendingEditorSelection) => void;
};

export const usePendingSelection = (
  editorRef: RefObject<HTMLElement | null>
): UsePendingSelectionResult => {
  const pendingSelectionRef = useRef<PendingEditorSelection | null>(null);
  const activeNote = useActiveNoteStore((state) => state.activeNote);

  const setPendingSelection = (selection: PendingEditorSelection) => {
    pendingSelectionRef.current = selection;
  };

  useLayoutEffect(() => {
    const root = editorRef.current;
    const pending = pendingSelectionRef.current;

    if (!root || !pending) return;

    setEditorSelection(root, pending);
    pendingSelectionRef.current = null;
  }, [editorRef, activeNote]);

  return {
    pendingSelectionRef,
    setPendingSelection,
  };
};