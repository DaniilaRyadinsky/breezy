import { TextSegmentType } from "@/entities/note/model/blockTypes";
import { RichTextOperation } from "@/entities/note/model/operationsType";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { useCallback } from "react";
import { LocalRichTextOperation, useContentEditable } from "./useContentEtitable";


type ApplyRichTextOperations = (
  noteId: string,
  blockId: string,
  operations: RichTextOperation[]
) => void;

export const useRichTextBlockEditor = (
  id: string,
  editableRef: React.RefCallback<HTMLElement>,
  segments: TextSegmentType[],
  applyOperations: ApplyRichTextOperations
) => {
  const handleOperations = useCallback(
    (operations: LocalRichTextOperation[]) => {
      const noteId = useActiveNoteStore.getState().activeNote?.id;
      if (!noteId) return;

      const preparedOperations: RichTextOperation[] = operations.map((op) => ({
        ...op,
        block_id: id,
        note_id: noteId,
      })) as RichTextOperation[];

      applyOperations(noteId, id, preparedOperations);
    },
    [id, applyOperations]
  );

  return useContentEditable(editableRef, segments, handleOperations);
};