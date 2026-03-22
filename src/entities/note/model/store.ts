import { create } from 'zustand'
import { Note } from './noteTypes'
import { Block } from './blockTypes'
import { getInsertPositionAfter } from '../lib/getInsertPosition'


interface ActiveNoteNoteState {
  activeNote: Note | null,

  selectNote: (note: Note) => void,
  clearNote: () => void,
  addBlock: (newBlock: Block) => void,
  insertBlockAfter: (afterId: string, newBlock: Block) => void,
  removeBlock: (id: string) => void,
}

export const useActiveNoteStore = create<ActiveNoteNoteState>((set) => ({
  activeNote: null,

  selectNote: (note) => set({ activeNote: note }),
  clearNote: () => set({ activeNote: null }),

  addBlock: (newBlock) => set((state) => {
    if (!state.activeNote) return state
    const newBlocks = [...state.activeNote.blocks, newBlock]
    console.log(newBlocks);
    return {
      activeNote: { ...state.activeNote, blocks: newBlocks }
    }
  })
  ,

  insertBlockAfter: (afterId: string, newBlock: Block) => set((state) => {
    if (!state.activeNote) return state

    const newBlocks = [...state.activeNote.blocks]
    const pos = getInsertPositionAfter(newBlocks, afterId);
    if (pos === null) return state;

    newBlocks.splice(pos, 0, newBlock);

    return {
      activeNote: { ...state.activeNote, blocks: newBlocks }
    }
  })
  ,

  removeBlock: (id: string) => set((state) => {
    if (!state.activeNote) return state
    const newBlocks = [...state.activeNote.blocks].filter(el => el.id !== id)
    return {
      activeNote: { ...state.activeNote, blocks: newBlocks }
    }
  })

}))



