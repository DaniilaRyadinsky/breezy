import styles from './TextBlock.module.css'
import TextSegment from '../TextSegment/TextSegment'
import { TextBlockType } from '@/entities/note/model/blockTypes'
import TextInput from '../../textInputt'


export const TextBlock = ({ id, data }: TextBlockType) => {
      const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
         console.log('key')
          if (e.key === 'Enter') {
              e.preventDefault()
              console.log('Enter pressed')
  
          }
      }
  

  return (
    // <TextInput text={data.text}/>
    <p id={id} className={styles.text} onKeyDown={onKeyDown}>
      {data.text.map(item => <TextSegment {...item} />)}
    </p>

  )
}

