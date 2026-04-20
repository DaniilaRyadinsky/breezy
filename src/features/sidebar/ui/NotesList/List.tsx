import { ListItem } from './ListItem'
import styles from './List.module.css'
import { NoteInfo } from '@/entities/note/model/noteTypes'
import { useActiveNoteStore } from '@/entities/note/model/store'


interface IList {
  list: NoteInfo[] | undefined
}

const List = ({ list }: IList) => {
  const activeNoteId = useActiveNoteStore((store) => store.activeNote?.id);

  return (
    <div className={styles.list}>
      {list?.map(item => <ListItem item={item} key={item.id} isSelected={activeNoteId === item.id} />)}
    </div>
  )
}

export default List