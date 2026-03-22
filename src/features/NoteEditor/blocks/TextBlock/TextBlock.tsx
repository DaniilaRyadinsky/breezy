import styles from './TextBlock.module.css'
import TextSegment from '../TextSegment/TextSegment'
import { TextBlockType } from '@/entities/note/model/blockTypes'

type TextBlockProps = TextBlockType & {
    editableRef: (node: HTMLElement | null) => void;
}
export const TextBlock = ({ id, data, editableRef }: TextBlockProps) => {

  return (
    // <TextInput text={data.text}/>
    <p id={id} className={styles.text} contentEditable ref={editableRef}>
      {data.text.map(item => <TextSegment {...item} />)}
    </p>

  )
}

