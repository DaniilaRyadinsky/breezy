import styles from './Paragraph.module.css'
import { IParagraph } from '../../model/types'
import TextSegment from '../TextSegment/TextSegment'


export const Paragraph = ({ id, content }: IParagraph) => {
  


  return (
    <p id={id} className={styles.text}>
      {content.map(item => <TextSegment {...item} />)}
    </p>

  )
}

