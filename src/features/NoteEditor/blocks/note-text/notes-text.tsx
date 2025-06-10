import React, { useState, useRef } from 'react'
import styles from './notes-text.module.css'
import BaseText, { IBaseText } from '../base-text/base-text'

export interface INotesText {
  id: string,
  size: number,
  content: IBaseText[] //дописать обработчики
}



export const NotesText = ({ id,size, content}: INotesText) => {

  return (
  <>
    {size === 1 &&
    <div className={styles.text_container} contentEditable>
      {content.map((base_block)=> <BaseText key={id} {...base_block}/>)}
    </div>}

    {size === 2 &&
    <h3 className={styles.text_container} contentEditable>
      {content.map((base_block)=> <BaseText key={id} {...base_block}/>)}
    </h3>}

    {size === 3 &&
    <h2 className={styles.text_container} contentEditable>
      {content.map((base_block)=> <BaseText key={id} {...base_block}/>)}
    </h2>}
    </>

  )
}

