import styles from './ListItem.module.css'


interface IListItem {
  name: string,
  description: string,
  date_changed: string,
  isSelected: boolean,
  onSelectNote: (name: string) => void,
}


export const ListItem = ({ name, description, date_changed, isSelected, onSelectNote }: IListItem) => {
  function Click() {
    onSelectNote(name)
    console.log(name)
  }

  const styleSelected = {
    backgroundColor: isSelected ? 'var(--md-sys-color-primary-container)' : ''
  };

  return (
    <li className={styles.item} >
      <div className={styles.item_container} onClick={() => Click()} style={styleSelected}>
        <div className={styles.item_title_container}>
          <h3 className={styles.item_title}>{name}</h3>
        </div>
        <div className={styles.item_description_container}>
          <p className={styles.item_description}>{description}</p>
        </div>
        <div>
          <p className={styles.item_date}>{date_changed}</p>
        </div>
      </div>
    </li>
  )
}