import clsx from 'clsx'
import { HeaderBlockType } from '@/entities/note/model/blockTypes'
import TextSegmentType from '../TextSegment/TextSegment'
import styles from './HeaderBlock.module.css'

type HeaderBlockProps = HeaderBlockType & {
  editableRef: (node: HTMLElement | null) => void;
}

const HeaderBlock = ({ id, data, editableRef }: HeaderBlockProps) => {
  const { level, text_data } = data;

  return (
    <h2
      ref={editableRef}
      id={id} className={clsx([styles.text], {
        [styles.h1]: (level === 1),
        [styles.h2]: (level === 2),
        [styles.h3]: (level === 3),
        [styles.h4]: (level === 4),
      })
      }>
      {text_data.map(item => <TextSegmentType {...item} />)}
    </h2>
  )
}

export default HeaderBlock