import { useEffect, useState } from 'react'
import styles from './MainTitle.module.css'
import { useNoteStore } from '../../../entities/note/model/store';


const MainTitle = () => {
  const {note} = useNoteStore((state) => state);
  const [titleState, setTitleState] = useState('');

  useEffect(()=>{
    if (note) {
      setTitleState(note.title)
    }
  }, [note])

  const handleAddNote = () => {
    if (!note) {
      
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