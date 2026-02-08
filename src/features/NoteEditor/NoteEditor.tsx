import clsx from 'clsx'
import styles from './NoteEditor.module.css'
import TableContents from './ui/TableContents/TableContents'
import { Block, BlockTypes, ListModes, StyleText } from '../../entities/note/model/types'
import BaseBlock from './blocks/BaseBlock/BaseBlock'
import MainTitle from './MainTitle/MainTitle'
import { useNoteStore } from '../../entities/note/model/store'

export interface INoteEditor {
    selectedId: string,
    sidebarMode: boolean
}

export const NoteEditor = ({ selectedId, sidebarMode }: INoteEditor) => {
    const { note } = useNoteStore((state) => state)

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
                <MainTitle title='Заметка 1' />
                <div className={styles.block}>
                    {note?.blocks.map((item: Block) => <BaseBlock {...item} />)}
                </div>
            </div>
            <TableContents />

        </div>

    )
}