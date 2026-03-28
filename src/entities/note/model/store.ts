import { create } from 'zustand'
import { ActiveNote, Note } from './noteTypes'
import { normalizeNote } from '../lib/normalizeNote'

interface ActiveNoteNoteState {
  activeNote: ActiveNote | null,

  selectNote: (note: Note) => void,
  clearNote: () => void,
}

export const useActiveNoteStore = create<ActiveNoteNoteState>((set) => ({
  activeNote: null,

  selectNote: (note) => set({ activeNote: normalizeNote(note) }),
  clearNote: () => set({ activeNote: null })

}))


