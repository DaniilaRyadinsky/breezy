import styles from './topbar.module.css'
import Burger from './burger'
import UserMenu from './user-menu'

const Topbar = () => {
  return (
    <div className={styles.topbar}>
        <Burger/>
        <h1 className={styles.topbar_title}>Breezy</h1>
        <UserMenu/>
    </div>
  )
}

export default Topbar