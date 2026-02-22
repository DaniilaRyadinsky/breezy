import { ListItem } from './ListItem'
import styles from './List.module.css'
import { NoteInfo } from '../../../../entities/note/model/noteTypes'


interface IList {
  list: NoteInfo[] | undefined
}

const List = ({list}: IList) => {
  return (
    <div className={styles.list}>
      {list?.map(item => <ListItem item={item} key={item.id}/>)}
    </div>
  )
}

export default List