import { Sidebar } from '@/features/sidebar'
import Topbar from '@/widgets/topbar/ui/topbar'
import styles from './MainPage.module.css'
import { NoteEditor } from '@/features/NoteEditor'

export const MainPage = () => {

  return (
    <div className={styles.main_page}>
      <Topbar/>
      <div className={styles.main_window}>
        <Sidebar  />
        <NoteEditor />
      </div>

    </div>
  )
}

