import React, { useState, useRef } from 'react'
import styles from './notes-text.module.css'
import BaseText, { IBaseText } from '../base-text/base-text'

export interface INotesText {
  id: string,
  content: IBaseText[] //дописать обработчики
}



export const NotesText = ({ id, content}: INotesText) => {
  // const [content, setContent] = useState(block.content)
  // const editableRef = useRef(null);

  // const handleInput = (event) => {
  //   setContent(event.target.innerText);
  //   onUpdate(block.id, event.target.innerText)

  // };

  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     e.preventDefault();
  //     onAdd(block.id);
  //   } else if (e.key === "Backspace" && content === "") {
  //     e.preventDefault();
  //     onDelete(block.id);
  //   }
  // };

  return (
    <div className={styles.text_container} contentEditable>
      {content.map((base_block)=> <BaseText {...base_block}/>)}
    </div>
  )
}

