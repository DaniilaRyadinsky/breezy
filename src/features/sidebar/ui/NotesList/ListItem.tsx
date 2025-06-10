
import { Tag, TagColor, } from '../Tag';
import styles from './List.module.css'


export interface IListItem {
  id: string,
  name: string,
  description: string,
  date_changed: string,
  isSelected: boolean,
  tag_color: TagColor| null,
  tag_text: string,
  onSelectNote: (name: string) => void,
}


export const ListItem = ({ id, name, description, date_changed, isSelected, tag_color, tag_text, onSelectNote }: IListItem) => {
  function Click() {
    onSelectNote(id)
  }

  const styleSelected = {
    backgroundColor: isSelected ? 'var(--md-sys-color-surface-container-highest)' : '',
    border: isSelected ? '1px solid var(--md-sys-color-outline)' : ''
  };

  return (
    <li className={styles.item} >
      <div className={styles.item_container} onClick={() => Click()} style={styleSelected}>
        <div className={styles.item_title_container}>
          <h3 className={styles.item_title}>{name}</h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_248_255)">
              <path fill="var(--md-sys-color-outline)" d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" />
            </g>
            <defs>
              <clipPath id="clip0_248_255">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>

        </div>
        <div className={styles.item_description_container}>
          <p className={styles.item_description}>{description}</p>
        </div>
        <div className={styles.bottom_container}>
          {tag_color !== null && <Tag color={tag_color} text={tag_text} />}
          
          <p className={styles.item_date}>{date_changed}</p>
        </div>
      </div>
    </li>
  )
}