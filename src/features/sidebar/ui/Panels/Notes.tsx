import { Search } from '../../../Search'
import List from '../NotesList/List'
import { notesList } from '../../test/test'
import styles from './panels.module.css'

interface INotes {
    selectedId: string,
    onSelectNote: (id:string) => void
}

const Notes = ({onSelectNote, selectedId} : INotes) => {
    return (
        <div className={styles.panel_container}>
            <h2 className={styles.title}>Все заметки</h2>
            <div>
                <Search />
            </div>
            <List list={notesList} selectedId={selectedId} onSelectNote={onSelectNote}/>
        </div>
    )
}

export default Notes