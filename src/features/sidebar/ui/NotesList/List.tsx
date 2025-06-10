import { ListItem } from './ListItem'
import { NoteInfo } from '../../types'
import styles from './List.module.css'


interface IList {
  selectedId: string,
  onSelectNote: (id: string) => void,
  list: NoteInfo[]
}

const List = ({list, selectedId, onSelectNote}: IList) => {
  return (
    <div className={styles.list}>
      {list.map(item => <ListItem {...item} isSelected={selectedId=== item.id ? true: false} onSelectNote={onSelectNote} />)}
    </div>
  )
}

export default List