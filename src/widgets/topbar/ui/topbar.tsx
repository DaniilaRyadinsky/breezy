import { useActiveNoteStore } from '../../../entities/note/model/store'
import { Button } from '../../../shared/ui/Button'
import Burger from './burger'
import styles from './topbar.module.css'
import UserMenu from './user-menu'

interface ITopbar {
  clickMenu: ()=> void
}

const Topbar = ({clickMenu}: ITopbar) => {
  const activeNote = useActiveNoteStore(state => state.activeNote)

  return (
    <div className={styles.topbar}>
      <div className={styles.left_container}>
        <Burger onClick={clickMenu}/>
        <h1 className={styles.breezy_title}>Breezy</h1>
      </div>
      <h1 className={styles.topbar_title}>{activeNote?.title}</h1>
      <div className={styles.right_container}>
        <Button mode={'on_secondary_container'} onClick={()=> console.log('click')}>Поделиться</Button>
      </div>
      
      <UserMenu />
    </div>
  )
}

export default Topbar