import { useEffect, useState } from 'react'
import styles from './MainTitle.module.css'
import { useActiveNoteStore } from '../../../entities/note/model/store';
import { useNoteMutations } from '../../../entities/note/lib/useNoteMuttion';


const MainTitle = () => {
  const activeNote = useActiveNoteStore((state) => state.activeNote);
  const [titleState, setTitleState] = useState('');

  const { createNote, patchTitle } = useNoteMutations()


  useEffect(() => {
    if (activeNote) {
      setTitleState(activeNote.title)
    }
  }, [activeNote])

  const handleAddNote = async () => {
    if (!activeNote) {
      createNote(titleState, () => console.log("создана новая заметка"));
    }
    else {
      patchTitle(titleState, activeNote.id!)
    }
  }


  return (
    <div className={styles.title_container}>
      <input
        className={styles.title}
        value={titleState}
        placeholder={'fff'}
        onChange={(e) => setTitleState(e.target.value)}
        onBlur={() => handleAddNote()} />
      {/* <h1 className={styles.title}>
            {title}
        </h1> */}
    </div>
  )
}

export default MainTitle