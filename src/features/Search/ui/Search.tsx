import search_icon from '../../../shared/assets/icons/search.svg'
import styles from './Search.module.css'

export const Search = () => {
  return (
    <div className={styles.search_container}>
        <p className={styles.search_title}>Поиск</p>
        <img className={styles.search_icon} src={search_icon} alt='лого' />
    </div>
  )
}
