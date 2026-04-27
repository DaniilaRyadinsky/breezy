import { Sidebar } from '@/widgets/sidebar'
import Topbar from '@/widgets/topbar/ui/topbar'
import styles from './MainPage.module.css'
import { NoteEditor } from '@/features/NoteEditor'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useNoteMutations } from '@/entities/note/lib/useNoteMuttion'

export const MainPage = () => {
  const { getNote } = useNoteMutations();
  const { noteId } = useParams();

  useEffect(() => {
    if (noteId) {
      getNote(noteId);
    }

  }, [noteId]);

  return (
    <div className={styles.main_page}>
      <Topbar />
      <div className={styles.main_window}>
        <Sidebar />
        <NoteEditor />
      </div>

    </div>
  )
}

