import { getNoteList } from '@/entities/note/api/noteApi'
import { Search } from '../../../../features/Search'
import List from '../NotesList/List'
import styles from './panels.module.css'
import { useQuery } from '@tanstack/react-query'


const Notes = () => {
    const { data: notesList, isLoading, error } = useQuery({
        queryKey: ['notesList'],
        queryFn: () => getNoteList(0, 10),
        staleTime: 0,
    })

    return (
        <div className={styles.panel_container}>
            <h2 className={styles.title}>Все заметки</h2>
            <div>
                <Search />
            </div>
            <List list={notesList}/>
        </div>
    )
}

export default Notes