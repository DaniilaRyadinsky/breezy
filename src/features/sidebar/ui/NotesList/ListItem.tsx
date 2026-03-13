import { useNoteMutations } from '../../../../entities/note/lib/useNoteMuttion';
import { NoteInfo } from '../../../../entities/note/model/noteTypes';
import { useActiveNoteStore } from '../../../../entities/note/model/store';
import { TagChip } from '../../../../entities/tag/ui/TagChip';
import PointsMenu from '../../../../shared/ui/PointsMenu/PointsMenu';
import styles from './List.module.css'

export interface IListItem {
  item: NoteInfo,
}

export const ListItem = ({ item }: IListItem) => {
  const {getNote} = useNoteMutations();
  const activeNote = useActiveNoteStore((store) => store.activeNote);
  const isSelected = activeNote?.id === item.id;

  const onClick = async () => {
    getNote(item.id)
    console.log("выбрана заметка", item.id)
  }

  const styleSelected = {
    backgroundColor: isSelected ? 'var(--md-sys-color-surface-container-highest)' : '',
    // border: isSelected ? '1px solid var(--md-sys-color-outline)' : ''
  };

  const menuOps = [
    {title: "Удалить заметку",
      action: () => console.log('1')
    },
    {title: "Добавить тег",
      action: () => console.log('2')
    },
    {title: "Поделиться",
      action: () => console.log('3')
    }
  ]

  return (
    <li className={styles.item} >
      <div className={styles.item_container} onClick={() => onClick()} style={styleSelected}>
        <div className={styles.item_title_container}>
          <h3 className={styles.item_title}>{item.title}</h3>
          <PointsMenu options={menuOps}/>

        </div>
        <div className={styles.item_description_container}>
          <p className={styles.item_description}>{item.first_block}</p>
        </div>
        <div className={styles.bottom_container}>
          {item.tag !== null && <TagChip color={item.tag.color} text={item.tag.title} />}

          <p className={styles.item_date}>{item.updated_at}</p>
        </div>
      </div>
    </li>
  )
}
