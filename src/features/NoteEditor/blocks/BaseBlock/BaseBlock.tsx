import { TextBlock } from '../TextBlock/TextBlock';
import ListBlock from '../ListBlock/ListBlock';
import HeaderBlock from '../HeaderBlock/HeaderBlock';
import type { BlockType } from '@/entities/note/model/blockTypes';
import { memo, useCallback, useRef } from 'react';
import { getCaretOffsetInElement, getCaretRectInside, getEditableStartX } from '../../lib';
import { useBlocksRegistry } from '../../model/BlocksRegistryContext';


import styles from './BaseBlock.module.css'
import { useActiveNoteStore } from '@/entities/note/model/store';
import { calculateTarget } from '../../lib/handleNavigate';


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


    const editableRef = useRef<HTMLElement | null>(null);

    const { registerBlock, unregisterBlock, focusBlockAtCoordinate } = useBlocksRegistry();

    const setEditableRef = useCallback((node: HTMLElement | null) => {
        editableRef.current = node;

        if (node) {
            registerBlock(props.id, node);
        } else {
            unregisterBlock(props.id);
        }
    }, [props.id, registerBlock, unregisterBlock]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const el = editableRef.current;
        if (!el) return;

        if (e.key === 'Enter') {
            e.preventDefault();
            const offset = getCaretOffsetInElement(el);
            const textLength = el.textContent?.length ?? 0;

            if (offset === textLength) {
                if (!block) return;
                props.onCreateBlock(block.type, props.id);
            } else {
                console.log("split блока");
            }
        }

        if (e.key === 'Backspace') {
            const textLength = el.textContent?.length ?? 0;
            if (!textLength) {
                e.preventDefault();
                props.onDeleteBlock(props.id);
            }
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const isEmpty = !(el.textContent ?? "").trim();

            if (isEmpty) {
                e.preventDefault();
                const direction = e.key === 'ArrowUp' ? 'up' : 'down';
                const target = calculateTarget(props.id, direction);

                if (!target) return;

                focusBlockAtCoordinate(target, getEditableStartX(el), direction);
                return;
            }
            const caretRect = getCaretRectInside(el);

            if (!caretRect) return;

            const blockRect = el.getBoundingClientRect();

            const shouldNavigate = e.key === 'ArrowUp' ?
                caretRect.top <= blockRect.top + 17
                : caretRect.bottom >= blockRect.bottom - 17;

            if (shouldNavigate) {
                e.preventDefault();

                const direction = e.key === 'ArrowUp' ? 'up' : 'down';
                const target = calculateTarget(props.id, direction);

                if (!target) return;

                focusBlockAtCoordinate(target, caretRect.left, direction);
            }
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