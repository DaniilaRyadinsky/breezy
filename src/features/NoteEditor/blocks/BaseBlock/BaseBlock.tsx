import { TextBlock } from '../TextBlock/TextBlock';
import ListBlock from '../ListBlock/ListBlock';
import HeaderBlock from '../HeaderBlock/HeaderBlock';
import type { Block } from '../../../../entities/note/model/blockTypes';


import styles from './BaseBlock.module.css'
import { useRef } from 'react';
import { getCaretOffsetInElement } from '../../lib';
import { initBlock, useActiveNoteStore } from '@/entities/note/model/store';

const BaseBlock = (props: Block) => {
    const ref = useRef<HTMLDivElement>(null)
    const insertBlockAfter = useActiveNoteStore((state) => state.insertBlockAfter)


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
        if (e.key === 'Enter') {
            e.preventDefault()

            const el = ref.current
            if (!el) return

            const offset = getCaretOffsetInElement(el)
            const textLength = el.textContent?.length ?? 0

            if (offset === textLength) {
                console.log("создать новый блок снизу", props.id)
                insertBlockAfter(props.id, initBlock(props.type));

            } else {
                console.log("split блока")
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
        >
            {GiveBlock()}
        </div>
    );
}

export default BaseBlock