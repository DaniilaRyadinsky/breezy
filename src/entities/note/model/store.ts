import { create } from 'zustand'
import { BlockTypes, StyleText, ListModes, Note } from './types'

const initialNote: Note = {
    id: "1",
    author: "1",
    editors: [],
    readers: [],
    title: "1",
    created_at: 1,
    updated_at: 1,
    tag: undefined,
    blocks:
        [
            {
                id: "ffj",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 1,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [
                        {
                            text: "В целом всё нормально, она готова зачесть, только она сказала оно добавить: это счётчик для корзины, чтобы можно было добавлять несколько одинаковых товаров к примеру.",
                            style: StyleText.Normal
                        },
                        {
                            text: " Пожалуйста помоги. ",
                            style: StyleText.Bold
                        },
                        {
                            text: "Она до 16:00 ещё подождёт.",
                            style: StyleText.Normal
                        }
                    ]
                }
            },
            {
                id: "ffj",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Заголовок 1",
                        style: StyleText.Normal
                    }]
                }
            },
            {
                id: "ffj",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Заголовок 2",
                        style: StyleText.Normal
                    }]
                }
            },
            {
                id: "ffj",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Заголовок 3",
                        style: StyleText.Normal
                    }]
                }
            },
            {
                id: "ffj",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Заголовок 4",
                        style: StyleText.Normal
                    }]
                }
            },
            {
                id: "ffjd",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                        style: StyleText.Normal
                    }
                    ]
                }
            },
            {
                id: "ffjd",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                        style: StyleText.Normal
                    }
                    ]
                }
            },
            {
                id: "ffjd",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Подправить реализацию фильтра корзины, чтобы в ней не было категорий товаров, а появлялись только сами товары, которые я выбрал и решил добавить",
                        style: StyleText.Normal
                    }
                    ]
                }
            },
            {
                id: "ffjd",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                        style: StyleText.Normal
                    }
                    ]
                }
            },
            {
                id: "ffjd",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                        style: StyleText.Normal
                    }
                    ]
                }
            },
            {
                id: "ffjd",
                type: BlockTypes.Paragraph,
                is_used: false,
                note_id: "1",
                order: 2,
                created_at: 1,
                updated_at: 1,
                data: {
                    text: [{
                        text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                        style: StyleText.Normal
                    }
                    ]
                }
            }]
}



interface ActiveNoteNoteState {
    activeNote: Note | null,

    selectNote : (note: Note) => void,
    clearNote: () => void,
}

export const useAciveNoteStore = create<ActiveNoteNoteState>((set) => ({
    activeNote: null,

    selectNote: (note) => set({ activeNote: note }),
    clearNote: () => set({activeNote: null})

}))