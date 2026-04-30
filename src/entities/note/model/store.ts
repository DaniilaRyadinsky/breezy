import { create } from 'zustand'
import { ActiveNote, Note } from './noteTypes'
import { normalizeNote } from '../lib/normalizeNote'
import { EMPTY_NOTE } from '@/shared/consts/emptyNote'

interface ActiveNoteNoteState {
  activeNote: ActiveNote | null,
  isDraft: boolean,
  selectNote: (note: Note) => void,
  startNewNote: () => void,
}


export const useActiveNoteStore = create<ActiveNoteNoteState>((set) => ({
  activeNote: EMPTY_NOTE,
  isDraft: true,
  
  selectNote: (note) =>
    set({
      activeNote: {
        ...normalizeNote(note),
        
      },
      isDraft: false,
    }),

  startNewNote: () =>
    set({
      activeNote: {
        ...EMPTY_NOTE,
      },
      isDraft: true,
    }),
}));


