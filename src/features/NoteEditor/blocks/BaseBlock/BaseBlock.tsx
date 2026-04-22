import { TextBlock } from '../TextBlock/TextBlock';
import ListBlock from '../ListBlock/ListBlock';
import HeaderBlock from '../HeaderBlock/HeaderBlock';
import { memo, useCallback } from 'react';
import { useActiveNoteStore } from '@/entities/note/model/store';
import { useBlocksRegistry } from '@/features/navigation';
import styles from './BaseBlock.module.css'
import { CodeBlock } from '../CodeBlock/CodeBlock';

type BaseBlockProps = {
    id: string;
};

export const BaseBlock = memo((props: BaseBlockProps) => {
    const block = useActiveNoteStore((state) =>
        state.activeNote?.blocksById[props.id] ?? null
    );

    if (!block) return null;

    const { registerBlock, unregisterBlock } = useBlocksRegistry();

    const setBlockRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            registerBlock(props.id, node);
        } else {
            unregisterBlock(props.id);
        }
    }, [props.id, registerBlock, unregisterBlock]);

    return (
        <div
            className={styles.container}
            data-block-id={props.id}
            data-block-type={block.type}
            ref={setBlockRef}
        >
            {block.type === "text" && <TextBlock {...block} />}
            {block.type === "list" && <ListBlock {...block} />}
            {block.type === "header" && <HeaderBlock {...block} />}
            {block.type === "code" && <CodeBlock {...block} />}
        </div>
    );
});
