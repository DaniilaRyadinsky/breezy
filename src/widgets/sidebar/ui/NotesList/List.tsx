import { ListItem } from './ListItem'
import styles from './List.module.css'
import { NoteInfo } from '@/entities/note/model/noteTypes'
import { useActiveNoteStore } from '@/entities/note/model/store'
import { useNavigate } from 'react-router-dom'
import { moveToTrash } from '@/entities/trash/api'
import { useQueryClient } from '@tanstack/react-query'


interface IList {
  list: NoteInfo[] | undefined
}

const List = ({ list }: IList) => {
  const activeNoteId = useActiveNoteStore((store) => store.activeNote?.id);
  const navigate = useNavigate();

  const qc = useQueryClient()

  const handleDelete = async(id: string) => {
    await moveToTrash(id);

    await qc.invalidateQueries({
      queryKey: ["notesList"],
    });

    if (id === activeNoteId) {
      navigate("/");
    }
  }

  return (
    <div className={styles.list}>
      {list?.map(item => <ListItem item={item} key={item.id} isSelected={activeNoteId === item.id} onDelete={handleDelete} />)}
    </div>
  )
}

export default List