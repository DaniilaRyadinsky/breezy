import styles from './Paragraph.module.css'
import { IParagraph } from '../../../../entities/note/model/noteTypes'
import TextSegment from '../TextSegment/TextSegment'


export const Paragraph = ({ id, data }: IParagraph) => {
  


  return (
    <p id={id} className={styles.text}>
      {data.text.map(item => <TextSegment {...item} />)}
    </p>

  )
}

