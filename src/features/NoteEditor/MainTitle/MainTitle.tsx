import { useEffect, useState } from 'react'
import styles from './MainTitle.module.css'
import { useActiveNoteStore } from '../../../entities/note/model/store';



const MainTitle = () => {
  const {activeNote} = useActiveNoteStore((state) => state);
  const [titleState, setTitleState] = useState('');

  useEffect(()=>{
    if (activeNote) {
      setTitleState(activeNote.title)
    }
  }, [activeNote])

  const handleAddNote = () => {
    if (!activeNote) {

    }
  }

  return (
    <div className={styles.title_container}>
      <input className={styles.title} value={titleState} placeholder={'fff'}/>
        {/* <h1 className={styles.title}>
            {title}
        </h1> */}
    </div>
  )
}

export default MainTitle