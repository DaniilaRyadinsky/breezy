import { TextBlock } from '../TextBlock/TextBlock';
import ListBlock from '../ListBlock/ListBlock';
import HeaderBlock from '../HeaderBlock/HeaderBlock';
import type { Block, BlockType } from '../../../../entities/note/model/blockTypes';
import { useEffect, useRef } from 'react';
import { getCaretOffsetInElement, getCaretRectInside, getEditableStartX } from '../../lib';
import { useBlocksRegistry } from '../../model/BlocksRegistryContext';


import styles from './BaseBlock.module.css'


type BaseBlockProps = Block & {
    index: number;
    totalBlocks: number;
    onNavigate: (id: string, direction: 'up' | 'down', x: number) => void;
    onCreateBlock: (type: BlockType) => void;
    onDeleteBlock: () => void
}

const BaseBlock = (props: BaseBlockProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const { registerBlock, unregisterBlock } = useBlocksRegistry();

    useEffect(() => {
        if (ref.current) {
            registerBlock(props.id, ref.current);
        }
        return () => unregisterBlock(props.id);
    }, [props.id]);


    function GiveBlock() {
        switch (props.type) {
            case "text":
                return <TextBlock {...props} />;
            case "list":
                return <ListBlock {...props} />;
            case "header":
                return <HeaderBlock {...props} />;
            case "quote":
                return;
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const el = ref.current
        if (!el) return

        if (e.key === 'Enter') {
            e.preventDefault()
            const offset = getCaretOffsetInElement(el)
            const textLength = el.textContent?.length ?? 0

            if (offset === textLength) {
                console.log("создать новый блок снизу", props.id)
                props.onCreateBlock(props.type);

            } else {
                console.log("split блока")
            }
        }
        if (e.key === 'Backspace') {
            const textLength = el.textContent?.length ?? 0
            if (!textLength) {
                e.preventDefault()
                props.onDeleteBlock()
            }
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const isEmpty = !(el.textContent ?? "").trim();

            if (isEmpty) {
                e.preventDefault();
                props.onNavigate(
                    props.id,
                    e.key === 'ArrowUp' ? 'up' : 'down',
                    getEditableStartX(el)
                );
                return;
            }

            const caretRect = getCaretRectInside(el);
            if (!caretRect) return;

            const blockRect = el.getBoundingClientRect();
            const shouldNavigate =
                e.key === 'ArrowUp'
                    ? caretRect.top <= blockRect.top + 17
                    : caretRect.bottom >= blockRect.bottom - 17;

            if (shouldNavigate) {
                e.preventDefault();
                props.onNavigate(
                    props.id,
                    e.key === 'ArrowUp' ? 'up' : 'down',
                    caretRect.left
                );
            }
        }
    }

    const onInput = () => {
        const el = ref.current
        if (!el) return

        const caret = getCaretOffsetInElement(el)
        const text = el.textContent ?? ""

        if (caret === null) return

        const textBeforeCaret = text.slice(0, caret)

        const slashIndex = textBeforeCaret.lastIndexOf("/")

        if (slashIndex === -1) {
            // closeMenu()
            console.log('close menu')
            return
        }

        const query = textBeforeCaret.slice(slashIndex + 1)

        if (query.includes(" ")) {
            // closeMenu()
            console.log('close menu')
            return
        }

        console.log('open menu')
    }


    return (
        <div
            contentEditable
            suppressContentEditableWarning={true}
            className={styles.container}
            onKeyDown={onKeyDown}
            onInput={onInput}
            ref={ref}
            tabIndex={0}
        >
            {GiveBlock()}
        </div>
    );
}

export default BaseBlock