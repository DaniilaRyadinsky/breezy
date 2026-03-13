import clsx from 'clsx'
import styles from './NoteEditor.module.css'
import TableContents from './ui/TableContents/TableContents'
import BaseBlock from './blocks/BaseBlock/BaseBlock'
import MainTitle from './MainTitle/MainTitle'
import { useActiveNoteStore } from '../../entities/note/model/store'
import { Block } from '../../entities/note/model/blockTypes'
import { useAppStore } from '../../app/lib/AppStore'
import { ContextMenu } from '../../shared/ui/ContextMenu/ContextMenu'
import { initBlock } from '../../entities/note/model/store'




export const NoteEditor = () => {
    const activeNote = useActiveNoteStore((state) => state.activeNote);
    const isSidebarOpen = useAppStore(s => s.isSidebarOpen);

    const addBlock = useActiveNoteStore((state) => state.addBlock)

    const options = [
        {
            title: 'Add text block', action: () => {
                console.log('add text block')
                addBlock(initBlock('text'))
            }
        },
        { title: 'Add header block', action: () => addBlock(initBlock('header')) },
        { title: 'Add list block', action: () => addBlock(initBlock('list')) },
    ]

    return (
        <div className={styles.container}>
            <ContextMenu options={options}>
                <div className={clsx([styles.note_editor], {
                    [styles.sidebar_mode]: isSidebarOpen
                }
                )}
                data-content-editable-root="true"
                // suppressContentEditableWarning={true}
                // contentEditable
                // onContextMenu={e=> {e.preventDefault()}}
                >
                    <MainTitle />

                    <div className={styles.block} >
                        {activeNote?.blocks?.map((item: Block) => <BaseBlock key={item.id} {...item} />)}
                    </div>

                </div>
            </ContextMenu >
            <TableContents />

        </div>

    )
}