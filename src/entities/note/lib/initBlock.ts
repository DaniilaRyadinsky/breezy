import { Block, BlockType } from "../model/blockTypes"

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

