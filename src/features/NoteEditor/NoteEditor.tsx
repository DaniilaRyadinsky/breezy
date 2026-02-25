import clsx from 'clsx'
import styles from './NoteEditor.module.css'
import TableContents from './ui/TableContents/TableContents'
import BaseBlock from './blocks/BaseBlock/BaseBlock'
import MainTitle from './MainTitle/MainTitle'
import { useActiveNoteStore } from '../../entities/note/model/store'
import { Block } from '../../entities/note/model/blockTypes'
import { useAppStore } from '../../app/lib/AppStore'


export const NoteEditor = () => {
    const activeNote = useActiveNoteStore((state) => state.activeNote);
    const isSidebarOpen = useAppStore(s => s.isSidebarOpen);

    return (
        <div className={styles.container}>
            <div className={clsx([styles.note_editor], {
                [styles.sidebar_mode]: isSidebarOpen
            }
            )}
                data-content-editable-root="true"
                suppressContentEditableWarning={true}
                contentEditable
            // onContextMenu={e=> {e.preventDefault()}}
            >
                <MainTitle />
                <div className={styles.block}>
                    {activeNote?.blocks?.map((item: Block) => <BaseBlock {...item} />)}
                </div>
            </div>
            <TableContents />

        </div>

    )
}