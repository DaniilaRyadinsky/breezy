import { flushSync } from 'react-dom';
import { BlocksRegistryProvider, useBlocksRegistry } from './navigation/model/BlocksRegistryContext';
import { BlockType } from '@/entities/note/model/blockTypes';
import { useActiveNoteStore } from '@/entities/note/model/store';
import BaseBlock from './blocks/BaseBlock/BaseBlock';
import styles from './NoteEditor.module.css'
import { ContextMenu } from '@/shared/ui/ContextMenu/ContextMenu';
import TableContents from './ui/TableContents/TableContents';
import clsx from 'clsx'

import MainTitle from './MainTitle/MainTitle'

import { useAppStore } from '../../app/lib/AppStore'
import { useCallback, useRef } from 'react';
import { initBlock } from '@/entities/note/lib/initBlock';
import { deleteBlock, insertBlock } from '@/entities/note/model/storeOperations';


const NoteEditorContent = () => {
    const blockOrder = useActiveNoteStore((state) => state.activeNote?.blockOrder);
    const { focusBlock } = useBlocksRegistry();
    const titleRef = useRef<HTMLInputElement>(null)

    const isSidebarOpen = useAppStore(s => s.isSidebarOpen);

    const handleAddBlock = (type: 'text' | 'header' | 'list') => {
        const newBlock = initBlock(type);

        flushSync(() => {
            // addBlock(newBlock);
        });

        // focusBlock(newBlock.id, 'start');
    };

    const handleInsertBlock = useCallback(async (type: BlockType, afterId: string) => {
        const newBlockId = await insertBlock(type, afterId);
        if (!newBlockId) return;

        requestAnimationFrame(() => {
            focusBlock(newBlockId, 'start');
        });
    }, [insertBlock, focusBlock]);

    const handleDeleteBlock = useCallback(async (id: string) => {
        const prevBlockId = await deleteBlock(id);
        if (!prevBlockId) return;

        requestAnimationFrame(() => {
            focusBlock(prevBlockId, 'end');
        });
    }, [deleteBlock, focusBlock]);

    const options = [
        { title: 'Add text block', action: () => handleAddBlock('text') },
        { title: 'Add header block', action: () => handleAddBlock('header') },
        { title: 'Add list block', action: () => handleAddBlock('list') },
    ]

    return (
        <div className={styles.container}>
            <ContextMenu options={options}>
                <div className={clsx([styles.note_editor], {
                    [styles.sidebar_mode]: isSidebarOpen
                }
                )}
                >
                    <MainTitle ref={titleRef} />
                    {blockOrder?.map((id) => (
                        <BaseBlock
                            key={id}
                            id={id}
                            onCreateBlock={handleInsertBlock}
                            onDeleteBlock={handleDeleteBlock}
                        />
                    ))}
                </div>
            </ContextMenu >
            <TableContents />
        </div>
    )
}

export const NoteEditor = () => {
    return (
        <BlocksRegistryProvider>
            <NoteEditorContent />
        </BlocksRegistryProvider>
    )
}