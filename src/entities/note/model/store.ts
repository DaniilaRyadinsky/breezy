import { create } from 'zustand'
import { Note } from './noteTypes'
import { Block, BlockType } from './blockTypes'


interface ActiveNoteNoteState {
  activeNote: Note | null,

  selectNote: (note: Note) => void,
  clearNote: () => void,
  addBlock: (newBlock: Block) => void,
  insertBlockAfter: (afterId: string, newBlock: Block) => void,
}

export const useActiveNoteStore = create<ActiveNoteNoteState>((set) => ({
  activeNote: null,

  selectNote: (note) => set({ activeNote: note }),
  clearNote: () => set({ activeNote: null }),

  addBlock: (newBlock) => {
    set((state) => {
      if (!state.activeNote) return state
      const newBlocks = [...state.activeNote.blocks, newBlock]
      console.log(newBlocks);
      return {
        activeNote: { ...state.activeNote, blocks: newBlocks }
      }
    })
  },

  insertBlockAfter: (afterId: string, newBlock: Block) => {
    set((state) => {
      if (!state.activeNote) return state
      
      const newBlocks = [...state.activeNote.blocks]
      const index = newBlocks.findIndex(block => block.id === afterId)

      if (index === -1) return state;

      newBlocks.splice(index + 1, 0, newBlock);

      return {
        activeNote: { ...state.activeNote, blocks: newBlocks }
      }
    })
  }

}))



export const initBlock = (type: BlockType): Block => {
  switch (type) {
    case 'text':
      console.log('init text block')
      return {
        id: crypto.randomUUID(),
        type: 'text',
        pos: 0,
        data: {
          text: [],
        }
      } as Block
    case 'header':
      return {
        id: crypto.randomUUID(),
        type: 'header',
        pos: 0,
        data: {
          text_data: [],
          level: 1
        }
      } as Block
    case 'list':
      return {
        id: crypto.randomUUID(),
        type: 'list',
        pos: 0,
        data: {
          text_data: [],
          level: 1,
          type: 'unordered',
          value: 1,
        }
      }
    default:
      return {
        id: crypto.randomUUID(),
        type,
        pos: 0,
      } as Block
  }

}




