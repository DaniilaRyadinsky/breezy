import { flushSync } from 'react-dom'; // Важно!
import { BlocksRegistryProvider, useBlocksRegistry } from './model/BlocksRegistryContext';
import { Block, BlockType } from '@/entities/note/model/blockTypes';
import { useActiveNoteStore } from '@/entities/note/model/store';
import BaseBlock from './blocks/BaseBlock/BaseBlock';
import styles from './NoteEditor.module.css'
import { ContextMenu } from '@/shared/ui/ContextMenu/ContextMenu';
import TableContents from './ui/TableContents/TableContents';
import clsx from 'clsx'

import MainTitle from './MainTitle/MainTitle'

import { useAppStore } from '../../app/lib/AppStore'
import { useRef, useState } from 'react';
import { initBlock } from '@/entities/note/lib/initBlock';
import { insertBlock } from '@/entities/note/model/storeOperations';


const NoteEditorContent = () => {
    const activeNote = useActiveNoteStore((state) => state.activeNote);
    const addBlock = useActiveNoteStore((state) => state.addBlock);
    const removeBlock = useActiveNoteStore((state) => state.removeBlock)
    const { focusBlock, focusBlockAtCoordinate } = useBlocksRegistry();
    const titleRef = useRef<HTMLInputElement>(null)

    const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

    const isSidebarOpen = useAppStore(s => s.isSidebarOpen);

    const handleAddBlock = (type: 'text' | 'header' | 'list') => {
        const newBlock = initBlock(type);

        flushSync(() => {
            addBlock(newBlock);
        });

        focusBlock(newBlock.id, 'start');
    };

    const handleInsertBlock = async (type: BlockType, afterId: string) => {
        const newBlockId = await insertBlock(type, afterId);

        if (!newBlockId) return;

        setPendingFocusId(newBlockId);
    };

    // const handleInsertBlock = (type: BlockType, afterId: string) => {
    //     const blocks = useActiveNoteStore.getState().activeNote?.blocks ?? [];
    //     const newBlock = initBlock(type);

    //     const pos = getInsertPositionAfter(blocks, afterId);
    //     if (pos === null) return;

    //     const nextBlocks = insertBlockAfter(blocks, newBlock, pos);

    //     // убрать flushSync, так как он может вызвать проблемы с производительностью при вставке блоков в середину большого количества блоков. Вместо этого можно оптимизировать функцию insertBlockAfter, чтобы она не вызывала перерисовку всего списка блоков, а только тех, которые были изменены.
    //     flushSync(() => {
    //         useActiveNoteStore.setState((state) => ({
    //             activeNote: state.activeNote
    //                 ? { ...state.activeNote, blocks: nextBlocks }
    //                 : null,
    //         }));
    //     });

    //     focusBlock(newBlock.id, 'start');
    // };

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
                            onNavigate={handleNavigate}
                            onCreateBlock={(type) => { handleInsertBlock(type, item.id) }}
                            onDeleteBlock={() => handleDeleteBlock(item.id)}
                            pendingFocusId={pendingFocusId}
                            clearPendingFocus={() => setPendingFocusId(null)}
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