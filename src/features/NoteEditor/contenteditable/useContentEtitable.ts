import { TextSegmentType } from "@/entities/note/model/blockTypes";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { getSelectionOffsets, setSelectionOffsets } from "./lib/caretUtils";
import { getStyleAt, replaceRange, deleteRange } from "./lib/segmentsUtils";

export const useContentEditable = (
  editableRef: React.RefCallback<HTMLElement>,
  segments: TextSegmentType[],
  onChange: (segments: TextSegmentType[]) => void
) => {
  const segmentsRef = useRef<TextSegmentType[]>(segments);

  const localRef = useRef<HTMLParagraphElement | null>(null);

  const mergedRef = useCallback<React.RefCallback<HTMLParagraphElement>>(
    (node) => {
      localRef.current = node;
      editableRef(node);
    },
    [editableRef]
  );

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  useLayoutEffect(() => {
    const root = localRef.current;
    const pending = pendingSelectionRef.current;

    if (root && pending) {
      setSelectionOffsets(root, pending.start, pending.end);
      pendingSelectionRef.current = null;
    }
  }, [segments]);
  useEffect(() => {
    const root = localRef.current;
    if (!root) return;

    const handleBeforeInput = (e: InputEvent) => {
      if (e.isComposing) return;

      const selection = getSelectionOffsets(root);
      if (!selection) return;

      console.log(e.inputType)

      const currentSegments = segmentsRef.current;
      const currentStyle = getStyleAt(currentSegments, selection.start);

      switch (e.inputType) {
        case "insertText": {
          e.preventDefault();

          const text = e.data ?? "";
          const next = replaceRange(
            currentSegments,
            selection.start,
            selection.end,
            text,
            currentStyle
          );

          pendingSelectionRef.current = {
            start: selection.start + text.length,
            end: selection.start + text.length,
          };

          onChange(next);
          break;
        }

        case "deleteContentBackward": {
          e.preventDefault();

          let next: TextSegmentType[];
          let caret: number;

          if (selection.start !== selection.end) {
            next = deleteRange(currentSegments, selection.start, selection.end);
            caret = selection.start;
          } else if (selection.start > 0) {
            next = deleteRange(currentSegments, selection.start - 1, selection.start);
            caret = selection.start - 1;
          } else {
            return;
          }

          pendingSelectionRef.current = { start: caret, end: caret };
          onChange(next);
          break;
        }

        case "deleteContentForward": {
          e.preventDefault();

          const fullTextLength = currentSegments.reduce(
            (sum, seg) => sum + seg.text.length,
            0
          );

          let next: TextSegmentType[];
          let caret: number;

          if (selection.start !== selection.end) {
            next = deleteRange(currentSegments, selection.start, selection.end);
            caret = selection.start;
          } else if (selection.start < fullTextLength) {
            next = deleteRange(currentSegments, selection.start, selection.start + 1);
            caret = selection.start;
          } else {
            return;
          }

          pendingSelectionRef.current = { start: caret, end: caret };
          onChange(next);
          break;
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      const selection = getSelectionOffsets(root);
      if (!selection) return;

      const text = e.clipboardData?.getData("text/plain") ?? "";
      const currentSegments = segmentsRef.current;
      const currentStyle = getStyleAt(currentSegments, selection.start);

      const next = replaceRange(
        currentSegments,
        selection.start,
        selection.end,
        text,
        currentStyle
      );

      const caret = selection.start + text.length;
      pendingSelectionRef.current = { start: caret, end: caret };
      onChange(next);
    };

    root.addEventListener("beforeinput", handleBeforeInput);
    root.addEventListener("paste", handlePaste);

    return () => {
      root.removeEventListener("beforeinput", handleBeforeInput);
      root.removeEventListener("paste", handlePaste);
    };
  }, []);

  return {
    mergedRef

  }
}