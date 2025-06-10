import React, { useState } from 'react'
import styles from './notes-title.module.css'


const NotesTitle = ({title, setTitle}) => {
  return (
    <div className={styles.title_container}>
      <input className={styles.title} value={title} placeholder='New note' onChange={(e) => setTitle(e.target.value)} />
    </div>
  )
}


const NotesTitleH1 = (props) => {
      const [content, setContent] = useState(props.block.content)

    return (
        <div className={styles.titleH1_container}>
            <h1
                className={styles.titleH1}
                contentEditable
                suppressContentEditableWarning={true}
                onChange={e=>setContent(e.target.innerText)} >
                {content}
            </h1>
        </div>
    )
}

const NotesTitleH2 = (props) => {
    const [content, setContent] = useState(props.block.content)

    return (
        <div className={styles.titleH2_container}>
            <h2
                className={styles.titleH2}
                contentEditable
                suppressContentEditableWarning={true}
                onChange={e=>setContent(e.target.innerText)} >
                {content}
            </h2>
        </div>
    )
}

const NotesTitleH3 = (props) => {
  const [content, setContent] = useState(props.block.content)

  return (
      <div className={styles.titleH3_container}>
          <h3
              className={styles.titleH3}
              contentEditable
              suppressContentEditableWarning={true}
              onChange={e=>setContent(e.target.innerText)} >
              {content}
          </h3>
      </div>
  )
}

export  {NotesTitle, NotesTitleH1,NotesTitleH2,NotesTitleH3}