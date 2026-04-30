import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createNoteApi, getNoteApi, patchTitleApi } from "../api/noteApi"
import { useActiveNoteStore } from "../model/store";

export const useNoteMutations = () => {
  const qc = useQueryClient()
  const selectNote = useActiveNoteStore(s => s.selectNote);

  const getNote = async (id: string) => {
    const data = await qc.fetchQuery({
      queryKey: ['note', id],
      queryFn: () => getNoteApi(id),
    })
    selectNote(data)
  }

  const createNoteMutation = useMutation({
    mutationFn: ({title, note_id}: {title: string, note_id: string}) => createNoteApi(title, note_id),
    onSuccess: async (res) => {
      getNote(res.id);
      qc.invalidateQueries({ queryKey: ["notesList"] });
    },
  })

  const patchTitleMutation = useMutation({
    mutationFn: ({ title, note_id }: { title: string, note_id: string }) =>
      patchTitleApi(title, note_id),
    onSuccess: (_data, { note_id, title }) => {
      qc.setQueryData(["note", note_id], (oldNote: any) => {
      if (!oldNote) return oldNote;

      return {
        ...oldNote,
        title,
      };
    });

    useActiveNoteStore.setState((state) => {
      if (!state.activeNote || state.activeNote.id !== note_id) {
        return state;
      }

      return {
        activeNote: {
          ...state.activeNote,
          title,
        },
      };
    });

    qc.invalidateQueries({ queryKey: ["notesList"] });
    }
  })

  const createNote = (title: string, onSuccess?: () => void) => {
    createNoteMutation.mutate({ title, note_id: crypto.randomUUID() }, {
      onSuccess: () => onSuccess?.(),
    })
  }


  const patchTitle = (title: string, note_id: string) => {
    patchTitleMutation.mutate({ title, note_id })
  }

  return {
    getNote,
    createNote,
    patchTitle
  }
}