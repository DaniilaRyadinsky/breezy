import { StyleText } from '../../entities/note/base-text/base-text'
import { NoteEditor } from '../../features/NoteEditor'
import { INoteEditor } from '../../features/NoteEditor/NoteEditor'
import { Sidebar } from '../../widgets/sidebar'
import { notesList } from '../../widgets/sidebar/test/test'
import Topbar from '../../widgets/topbar/ui/topbar'
import styles from './MainPage.module.css'

const MainPage = () => {

  const note: INoteEditor = {
    blocks: [
      {
        id: '1',
        content: [
          {
            id: '01',
            style: StyleText.Normal,
            text: 'это текстовый блок. '
          },
          {
            id: '001',
            style: StyleText.Bold,
            text: 'это текстовый блок жирный'
          }
        ]
      },
      {
        id: '1',
        content: [
          {
            id: '01',
            style: StyleText.Normal,
            text: 'это текстовый блок'
          }
        ]
      },
      {
        id: '2',
        content: [
          {
            id: '02',
            style: StyleText.Italic,
            text: 'это текстовый блок'
          }
        ]
      },
      {
        id: '3',
        content: [
          {
            id: '03',
            style: StyleText.Bold,
            text: 'это текстовый блок'
          }
        ]
      }
    ]
  }

  return (
    <div className={styles.main_page}>
      <Topbar />
      <div className={styles.main_window}>
        <Sidebar files={notesList} onSelectNote={(name: string) => console.log(name)} />
        <NoteEditor {...note}/>
      </div>

    </div>
  )
}

export default MainPage