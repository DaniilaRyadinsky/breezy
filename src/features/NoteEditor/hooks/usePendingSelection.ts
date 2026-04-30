import { useRef, useLayoutEffect, RefObject, useCallback } from "react";
import { PendingEditorSelection, scrollEditorSelectionIntoView, setEditorSelection } from "../lib/selection";

export type UsePendingSelectionResult = {
  pendingSelectionRef: React.MutableRefObject<PendingEditorSelection | null>;
  setPendingSelection: (selection: PendingEditorSelection) => void;
};

export const usePendingSelection = (
  editorRef: RefObject<HTMLElement | null>
): UsePendingSelectionResult => {
  const pendingSelectionRef = useRef<PendingEditorSelection | null>(null);

  const setPendingSelection = useCallback(
    (selection: PendingEditorSelection) => {
      pendingSelectionRef.current = selection;
    },
    []
  );

  useLayoutEffect(() => {
    const root = editorRef.current;
    const pending = pendingSelectionRef.current;

    if (!root || !pending) return;

    setEditorSelection(root, pending);
    scrollEditorSelectionIntoView(root, pending);

    pendingSelectionRef.current = null;
  });

  return {
    pendingSelectionRef,
    setPendingSelection,
  };
};