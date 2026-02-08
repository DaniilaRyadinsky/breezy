import { IList, ListModes } from '../../../../entities/note/model/types'
import TextSegment from '../TextSegment/TextSegment'
import styles from './List.module.css'




const NotesList = ({ id, content, tabs, mode, checked }: IList) => {


  function GetSign() {
    switch (mode) {
      case ListModes.Unordered:
        return <svg fill="none" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="2.5" fill="var(--md-sys-color-primary)" />
        </svg>;
      case ListModes.Ordered:
        return <>{checked + '.'}</>
      case ListModes.Todo:
        return <div></div>
    }
  }

  const tabStyle= {
    marginLeft: 20*tabs+"px"
  }

  return (
    <div className={styles.list_container} style={tabStyle}>
      <div className={styles.list_sign}>
        {GetSign()}
      </div>
      <p id={id} className={styles.text}>
        {content.map(item => <TextSegment {...item} />)}
      </p>
    </div>
  );
}

export default NotesList