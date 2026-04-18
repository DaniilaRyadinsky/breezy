import { BlocksRegistryProvider, useBlocksRegistry } from "@/features/navigation";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { applyDocumentOperations } from "@/entities/note/model/storeOperations";
import styles from "./NoteEditor.module.css";
import TableContents from "./ui/TableContents/TableContents";
import clsx from "clsx";
import MainTitle from "./MainTitle/MainTitle";
import { useAppStore } from "@/app/model/AppStore";
import { useRichTextEditor } from "../contenteditable";
import { useRef, useCallback } from "react";
import { BaseBlock } from "./blocks/BaseBlock/BaseBlock";
import { useBlockStructureEditor } from "../contenteditable/useBlockStructureEditor";
import { useSelectionMenu } from "../selectionMenu/lib/useSelectionMenu";
import { Menu, MenuItem } from "@mui/material";

const NoteEditorContent = () => {
  const blockOrder = useActiveNoteStore((state) => state.activeNote?.blockOrder);
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);

  const titleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { registerEditorRoot } = useBlocksRegistry();

  const setEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      editorRef.current = node;
      registerEditorRoot(node);
    },
    [registerEditorRoot]
  );

  const { applyStyleToSelection } = useRichTextEditor(editorRef, applyDocumentOperations);

  const { menuPosition, isOpen, closeMenu, restoreSelection } = useSelectionMenu(editorRef);

  useBlockStructureEditor(editorRef);

  return (
    <div className={styles.container}>
      <div
        className={clsx(styles.note_editor, {
          [styles.sidebar_mode]: isSidebarOpen,
        })}
      >
        <MainTitle ref={titleRef} />

        <div
          ref={setEditorRef}
          contentEditable
          suppressContentEditableWarning
          className={styles.blocks_root}
        >
          {blockOrder?.map((id) => (
            <BaseBlock key={id} id={id} />
          ))}

          <Menu
            open={isOpen}
            onClose={closeMenu}
            anchorReference="anchorPosition"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            anchorPosition={
              menuPosition
                ? { top: menuPosition.top, left: menuPosition.left }
                : undefined
            }
          >
            <MenuItem
              onClick={() => {
                restoreSelection();
                applyStyleToSelection("default");
                closeMenu();
              }}
            >
              Default
            </MenuItem>

            <MenuItem
              onClick={() => {
                restoreSelection();
                applyStyleToSelection("bold");
                closeMenu();
              }}
            >
              Bold
            </MenuItem>

            <MenuItem
              onClick={() => {
                restoreSelection();
                applyStyleToSelection("italic");
                closeMenu();
              }}
            >
              Italic
            </MenuItem>

            <MenuItem
              onClick={() => {
                restoreSelection();
                applyStyleToSelection("underline");
                closeMenu();
              }}
            >
              Underline
            </MenuItem>
          </Menu>

        </div>
      </div>

      <TableContents />
    </div>
  );
};

export const NoteEditor = () => {
  return (
    <BlocksRegistryProvider>
      <NoteEditorContent />
    </BlocksRegistryProvider>
  );
};