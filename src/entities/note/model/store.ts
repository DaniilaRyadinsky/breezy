import { create } from 'zustand'
import { Note } from './noteTypes'


interface ActiveNoteNoteState {
    activeNote: Note | null,

    selectNote: (note: Note) => void,
    clearNote: () => void,
}

export const useActiveNoteStore = create<ActiveNoteNoteState>((set) => ({
    activeNote: null,

    selectNote: (note) => set({ activeNote: note }),
    clearNote: () => set({ activeNote: null })

}))