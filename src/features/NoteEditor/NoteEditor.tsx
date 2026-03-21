// NoteEditor.tsx
import { flushSync } from 'react-dom'; // Важно!
import { BlocksRegistryProvider, useBlocksRegistry } from './model/BlocksRegistryContext'; // Путь к вашему файлу
import { Block, BlockType } from '@/entities/note/model/blockTypes';
import { useActiveNoteStore, initBlock } from '@/entities/note/model/store';
import BaseBlock from './blocks/BaseBlock/BaseBlock';
import styles from './NoteEditor.module.css'
import { ContextMenu } from '@/shared/ui/ContextMenu/ContextMenu';
import TableContents from './ui/TableContents/TableContents';
import clsx from 'clsx'

import MainTitle from './MainTitle/MainTitle'

import { useAppStore } from '../../app/lib/AppStore'
import { useRef } from 'react';




// Внутренний компонент, чтобы иметь доступ к контексту
const NoteEditorContent = () => {
    const activeNote = useActiveNoteStore((state) => state.activeNote);
    const addBlock = useActiveNoteStore((state) => state.addBlock);
    const removeBlock = useActiveNoteStore((state) => state.removeBlock)
    const insertBlockAfter = useActiveNoteStore((state) => state.insertBlockAfter);
    const { focusBlock, focusBlockAtCoordinate } = useBlocksRegistry();
    const titleRef = useRef<HTMLInputElement>(null)

    const isSidebarOpen = useAppStore(s => s.isSidebarOpen);

    const handleAddBlock = (type: 'text' | 'header' | 'list') => {
        const newBlock = initBlock(type);

        flushSync(() => {
            addBlock(newBlock);
        });

        focusBlock(newBlock.id, 'start');
    };

    const handleInsertBlock = (type: BlockType, id: string) => {
        const newBlock = initBlock(type);

        flushSync(() => {
            insertBlockAfter(id, newBlock);
        });

        focusBlock(newBlock.id, 'start');
    };

    const handleDeleteBlock = (id: string) => {
        const activeNote = useActiveNoteStore.getState().activeNote;
        if (!activeNote) return;

        const blocks = activeNote.blocks;
        const index = blocks.findIndex((b) => b.id === id);

        if (index <= 0) {
            flushSync(() => {
                removeBlock(id);
            });
            if (titleRef.current) titleRef.current.focus();
            return;
        }

        const prevBlockId = blocks[index - 1].id;

        flushSync(() => {
            removeBlock(id);
        });

        focusBlock(prevBlockId, 'end');
    };


    const handleNavigate = (id: string, direction: 'up' | 'down', x: number) => {
        if (!activeNote) return;
        const index = activeNote.blocks.findIndex((b) => b.id === id);
        if (index === -1) return;

        const target =
            direction === 'up' ? activeNote.blocks[index - 1] : activeNote.blocks[index + 1];

        if (!target) return;

        focusBlockAtCoordinate(target.id, x, direction);
    };

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
                    {activeNote?.blocks?.map((item: Block, index: number) => (
                        <BaseBlock
                            key={item.id}
                            {...item}
                            index={index}
                            totalBlocks={activeNote.blocks.length}
                            onNavigate={handleNavigate} // Передаем навигацию
                            onCreateBlock={(type) => { handleInsertBlock(type, item.id) }}
                            onDeleteBlock={() => handleDeleteBlock(item.id)}
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