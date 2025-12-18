import clsx from 'clsx'
import styles from './NoteEditor.module.css'
import TableContents from './ui/TableContents/TableContents'
import { Block, BlockTypes, ListModes, StyleText } from './model/types'
import BaseBlock from './blocks/BaseBlock/BaseBlock'
import MainTitle from './MainTitle/MainTitle'

export interface INoteEditor {
    selectedId: string,
    sidebarMode: boolean
}

export const NoteEditor = ({ selectedId, sidebarMode }: INoteEditor) => {
    const list: Block[] = [
        {
            id: "ffj",
            type: BlockTypes.Paragraph,
            content: [{
                text: "В целом всё нормально, она готова зачесть, только она сказала оно добавить: это счётчик для корзины, чтобы можно было добавлять несколько одинаковых товаров к примеру.",
                style: StyleText.Normal
            },
            {
                text:" Пожалуйста помоги. ",
                style: StyleText.Bold
            },
            {
                text: "Она до 16:00 ещё подождёт.",
                style: StyleText.Normal
            }
            ]
        },
        {
            id: "ffj",
            type: BlockTypes.Header,
            level:1,
            content: [{
                text: "Заголовок 1",
                style: StyleText.Normal
            }]
        },
        {
            id: "ffj",
            type: BlockTypes.Header,
            level:2,
            content: [{
                text: "Заголовок 2",
                style: StyleText.Normal
            }]
        },
        {
            id: "ffj",
            type: BlockTypes.Header,
            level:3,
            content: [{
                text: "Заголовок 3",
                style: StyleText.Normal
            }]
        },
        {
            id: "ffj",
            type: BlockTypes.Header,
            level:4,
            content: [{
                text: "Заголовок 4",
                style: StyleText.Normal
            }]
        },
        {
            id: "ffjd",
            type: BlockTypes.List,
            tabs:0,
            mode: ListModes.Ordered,
            checked: 1,
            content: [{
                text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                style: StyleText.Normal
            }
            ]
        },
        {
            id: "ffjd",
            type: BlockTypes.List,
            tabs:1,
            mode: ListModes.Ordered,
            checked: 2,
            content: [{
                text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                style: StyleText.Normal
            }
            ]
        },
        {
            id: "ffjd",
            type: BlockTypes.List,
            tabs:2,
            mode: ListModes.Ordered,
            checked: 3,
            content: [{
                text: "Подправить реализацию фильтра корзины, чтобы в ней не было категорий товаров, а появлялись только сами товары, которые я выбрал и решил добавить",
                style: StyleText.Normal
            }
            ]
        },
        {
            id: "ffjd",
            type: BlockTypes.List,
            tabs:0,
            mode: ListModes.Unordered,
            checked: null,
            content: [{
                text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                style: StyleText.Normal
            }
            ]
        },
        {
            id: "ffjd",
            type: BlockTypes.List,
            tabs:0,
            mode: ListModes.Unordered,
            checked: null,
            content: [{
                text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                style: StyleText.Normal
            }
            ]
        },
        {
            id: "ffjd",
            type: BlockTypes.List,
            tabs:0,
            mode: ListModes.Unordered,
            checked: null,
            content: [{
                text: "Связать форму, которая на странице контакты с бд, чтобы можно было отправлять с ней отзывы в бд",
                style: StyleText.Normal
            }
            ]
        }

    ]

    return (
        <div className={styles.container}>
            <div className={clsx([styles.note_editor], {
                [styles.sidebar_mode]: sidebarMode
            }
            )}
                data-content-editable-root="true"
                suppressContentEditableWarning={true}
                contentEditable
            // onContextMenu={e=> {e.preventDefault()}}
            >
                <MainTitle title='Заметка 1'/>
                <div className={styles.block}>
                    {list.map(item => <BaseBlock {...item} />)}
                </div>
            </div>
            <TableContents />

        </div>

    )
}