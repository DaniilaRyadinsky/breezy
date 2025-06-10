import clsx from 'clsx'
import {NotesText,  INotesText } from './blocks/index'
import styles from './NoteEditor.module.css'
import TableContents from './ui/TableContents/TableContents'

export interface INoteEditor {
    selectedId:string,
    sidebarMode:boolean
}

export const NoteEditor = ({selectedId, sidebarMode}:INoteEditor) => {
    // function parceBlocks(block) {
    //     if (block.type === 'text')
    //         return <NotesText
    //             data-id={block.id}
    //             block={block}
    //             onAdd={handleAdd}
    //             onUpdate={handleUpdate}
    //             onDelete={handleDelete}
    //         />
    //     else if (block.type === 'h1')
    //         return <NotesTitleH1 id={block.id} block={block} />
    //     else if (block.type === 'h2')
    //         return <NotesTitleH2 id={block.id} block={block} />
    //     else if (block.type === 'h3')
    //         return <NotesTitleH3 key={block.id} block={block} />
    // }

    // // Функция для обработки нажатия клавиши
    // const handleKeyDown = (event) => {
    //     if (event.key === 'Enter') {
    //         event.preventDefault(); // Предотвращаем стандартное поведение
    //         // Перемещаем фокус на следующее поле ввода
    //         if (noTitleRef.current) {
    //             noTitleRef.current.focus();
    //         }
    //         else {
    //         }
    //     }
    // };

    // const handleAdd = (id) => {
    //     const newBlock = { id: Date.now(), text: "" };
    //     setBlocks((prev) => {
    //         const index = prev.findIndex((b) => b.id === id);
    //         return [...prev.slice(0, index + 1), newBlock, ...prev.slice(index + 1)];
    //     });
    // };

    // const handleUpdate = (id, text) => {
    //     setBlocks((prev) => {
    //         const index = prev.findIndex((b) => b.id === id);
    //         if (index === -1) return prev;
    //         const updatedBlocks = [...prev];
    //         updatedBlocks[index] = { ...updatedBlocks[index], text };
    //         return updatedBlocks;
    //     });
    // };

    // const handleDelete = (id) => {
    //     setBlocks((prev) => prev.filter((b) => b.id !== id));
    // };

    // function makeAmerica(e) {
    //     e.preventDefault()
    //     const range = window.getSelection();
    //     // const fragment = range.extractContents();
    //     console.log(range)
    //     // console.log(fragment)
    // }
    
    return (
        <div className={styles.container}>
            <div className={clsx([styles.note_editor],{
            [styles.sidebar_mode]: sidebarMode}
        )}
            data-content-editable-root="true"
            suppressContentEditableWarning={true}
            contentEditable
        // onContextMenu={e=> {e.preventDefault()}}
        >
            {/* <NotesTitle title={filename} setTitle={setFilename}/>
            {console.log(0.1 + 0.2 === 0.3)} */}
            {/* {blocks.map(block => <NotesText {...block}/>)} */}
            <div className={styles.block}></div>
        </div>
        <TableContents/>          

        </div>
        
    )
}