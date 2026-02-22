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
    mutationFn: (title: string) => createNoteApi(title),
    onSuccess: async (res) => {
      getNote(res.id);
    },
  })

  const patchTitleMutation = useMutation({
    mutationFn: ({ title, id }: { title: string, id: string }) =>
      patchTitleApi(title, id),
    onSuccess: () => {
      console.log("изменен заголовок")
    }
  })

  const createNote = (title: string, onSuccess?: () => void) => {
    createNoteMutation.mutate(title, {
      onSuccess: () => onSuccess?.(),
    })
  }


  const patchTitle = (title: string, id: string) => {
    patchTitleMutation.mutate({ title, id })
  }

  return {
    getNote,
    createNote,
    patchTitle
  }
}