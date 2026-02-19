import clsx from 'clsx'
import { IHeader } from '../../../../entities/note/model/noteTypes'
import TextSegment from '../TextSegment/TextSegment'
import styles from './Header.module.css'

const Header = ({id, content, level}: IHeader) => {

  
  return (
    <h2 id={id} className={clsx([styles.text], {
        [styles.h1]: (level === 1),
        [styles.h2]: (level === 2),
        [styles.h3]: (level === 3),
        [styles.h4]: (level === 4),
    })
        }>
      {content.map(item => <TextSegment {...item} />)}
    </h2>
  )
}

export default Header