import { useState } from 'react'
import { Sidebar } from '../../features/sidebar'
import Topbar from '../../widgets/topbar/ui/topbar'
import styles from './MainPage.module.css'
import { NoteEditor } from '../../features/NoteEditor'

const MainPage = () => {
  const [selectNoteId, setSelectNoteId] = useState("")
  const [sidebarMode, setSidebarMode] = useState(false)



  return (
    <div className={styles.main_page}>
      <Topbar filename={"Заметка 1"} clickMenu={()=> setSidebarMode(!sidebarMode)}/>
      <div className={styles.main_window}>
        <Sidebar isVisible={sidebarMode} setIsVisible={setSidebarMode} selectedId={selectNoteId} onSelectNote={id => setSelectNoteId(id)} />
        <NoteEditor selectedId={selectNoteId} sidebarMode={sidebarMode}/>
      </div>

    </div>
  )
}

export default MainPage