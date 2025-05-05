import styles from './sidebarList.module.css'
import {ListItem } from './ListItem'
import { NoteInfo } from '../types'

interface ISideBar{
  files: NoteInfo[]
  onSelectNote: (name: string) => void
}

export const Sidebar = ({files, onSelectNote}: ISideBar) => {

  return (
    <div className={styles.sidebar}>
      <ul className={styles.list}>
        {files.map(item => <ListItem onSelectNote={onSelectNote} {...item}/>)}
      </ul>
    </div>
  )
}