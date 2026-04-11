import { TextBlock } from '../TextBlock/TextBlock';
import ListBlock from '../ListBlock/ListBlock';
import HeaderBlock from '../HeaderBlock/HeaderBlock';
import type { BlockType } from '@/entities/note/model/blockTypes';
import { memo } from 'react';
import { useActiveNoteStore } from '@/entities/note/model/store';
import { useBlockRegistry,  useBlockNavigation} from '@/features/navigation';
import { useBlockCreateDelete } from './useBlockCreateDelete';
import { getCaretOffsetInElement } from '@/shared/lib/utils';

import styles from './BaseBlock.module.css'

type BaseBlockProps = {
    id: string;
    onCreateBlock: (type: BlockType, afterId: string) => void;
    onDeleteBlock: (id: string) => void;
};


const BaseBlock = memo((props: BaseBlockProps) => {
    const block = useActiveNoteStore((state) =>
        state.activeNote?.blocksById[props.id] ?? null
    );

    if (!block) return null;


    const { editableRef, setEditableRef } = useBlockRegistry(props.id);
    const { onEnterDown, onBackspaceDown } = useBlockCreateDelete(
        props.id,
        block.type,
        editableRef,
        props.onCreateBlock,
        props.onDeleteBlock
    );
    const {handleHorizontalArrow, handleVerticalArrow } = useBlockNavigation(editableRef, props.id);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            onEnterDown(e);
        }
        if (e.key === 'Backspace') {
            onBackspaceDown(e);
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            handleVerticalArrow(e);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            handleHorizontalArrow(e);
        }
    };

    const onInput = () => {
        const el = editableRef.current;
        if (!el) return;

        const caret = getCaretOffsetInElement(el);
        const text = el.textContent ?? "";

        if (caret === null) return;

        const textBeforeCaret = text.slice(0, caret);
        const slashIndex = textBeforeCaret.lastIndexOf("/");

        if (slashIndex === -1) {
            console.log('close menu');
            return;
        }

        const query = textBeforeCaret.slice(slashIndex + 1);

        if (query.includes(" ")) {
            console.log('close menu');
            return;
        }

        console.log('open menu');
    };

    return (
        <div
            className={styles.container}
            onKeyDown={onKeyDown}
            onInput={onInput}
        >
            {block.type === 'text' && (<TextBlock {...block} editableRef={setEditableRef} />)}

            {block.type === 'list' && (<ListBlock {...block} editableRef={setEditableRef} />)}

            {block.type === 'header' && (<HeaderBlock {...block} editableRef={setEditableRef} />)}

            {block.type === 'quote' && null}
        </div>
    );
});

BaseBlock.displayName = 'BaseBlock';


export default BaseBlock;