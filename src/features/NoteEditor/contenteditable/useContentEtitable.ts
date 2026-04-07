import { TextSegmentType } from "@/entities/note/model/blockTypes";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { getSelectionOffsets, setSelectionOffsets } from "./lib/caretUtils";
import { RichTextOperation } from "@/entities/note/model/operationsType";

type CaretSelection = {
  start: number;
  end: number;
};

export type LocalRichTextOperation = Omit<
  RichTextOperation,
  "note_id" | "block_id"
>;

export const useContentEditable = (
  editableRef: React.RefCallback<HTMLElement>,
  segments: TextSegmentType[],
  onOperation: (operations: LocalRichTextOperation[]) => void
) => {
  const segmentsRef = useRef<TextSegmentType[]>(segments);
  const localRef = useRef<HTMLParagraphElement | null>(null);

  const pendingSelectionRef = useRef<CaretSelection | null>(null);

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

    const getTextLength = (currentSegments: TextSegmentType[]) => {
      return currentSegments.reduce((sum, seg) => {
        return sum + seg.string.length;
      }, 0);
    };

    const handleBeforeInput = (e: InputEvent) => {
      if (e.isComposing) return;

      const selection = getSelectionOffsets(root);
      if (!selection) return;

      const currentSegments = segmentsRef.current;
      const operations: LocalRichTextOperation[] = [];

      switch (e.inputType) {
        case "insertText": {
          const text = e.data ?? "";
          if (!text) return;

          e.preventDefault();

          if (selection.start !== selection.end) {
            operations.push({
              op: "delete_range",
              data: {
                start: selection.start,
                end: selection.end,
              },
            });
          }

          operations.push({
            op: "insert_text",
            data: {
              pos: selection.start,
              new_text: text,
            },
          });

          pendingSelectionRef.current = {
            start: selection.start + text.length,
            end: selection.start + text.length,
          };

          onOperation(operations);
          break;
        }

        case "deleteContentBackward": {
          e.preventDefault();

          if (selection.start !== selection.end) {
            operations.push({
              op: "delete_range",
              data: {
                start: selection.start,
                end: selection.end,
              },
            });

            pendingSelectionRef.current = {
              start: selection.start,
              end: selection.start,
            };

            onOperation(operations);
            return;
          }

          if (selection.start === 0) return;

          operations.push({
            op: "delete_range",
            data: {
              start: selection.start - 1,
              end: selection.start,
            },
          });

          pendingSelectionRef.current = {
            start: selection.start - 1,
            end: selection.start - 1,
          };

          onOperation(operations);
          break;
        }

        case "deleteContentForward": {
          e.preventDefault();

          const fullTextLength = getTextLength(currentSegments);

          if (selection.start !== selection.end) {
            operations.push({
              op: "delete_range",
              data: {
                start: selection.start,
                end: selection.end,
              },
            });

            pendingSelectionRef.current = {
              start: selection.start,
              end: selection.start,
            };

            onOperation(operations);
            return;
          }

          if (selection.start >= fullTextLength) return;

          operations.push({
            op: "delete_range",
            data: {
              start: selection.start,
              end: selection.start + 1,
            },
          });

          pendingSelectionRef.current = {
            start: selection.start,
            end: selection.start,
          };

          onOperation(operations);
          break;
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const selection = getSelectionOffsets(root);
      if (!selection) return;

      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (!text) return;

      e.preventDefault();

      const operations: LocalRichTextOperation[] = [];

      if (selection.start !== selection.end) {
        operations.push({
          op: "delete_range",
          data: {
            start: selection.start,
            end: selection.end,
          },
        });
      }

      operations.push({
        op: "insert_text",
        data: {
          pos: selection.start,
          new_text: text,
        },
      });

      pendingSelectionRef.current = {
        start: selection.start + text.length,
        end: selection.start + text.length,
      };

      onOperation(operations);
    };

    root.addEventListener("beforeinput", handleBeforeInput);
    root.addEventListener("paste", handlePaste);

    return () => {
      root.removeEventListener("beforeinput", handleBeforeInput);
      root.removeEventListener("paste", handlePaste);
    };
  }, [onOperation]);

  return {
    mergedRef,
  };
};