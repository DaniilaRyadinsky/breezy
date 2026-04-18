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
import { SelectionMenu } from "../selectionMenu/ui/SelectionMenu";
import { BlockType } from "@/entities/note/model/blockTypes";

const NoteEditorContent = () => {
  const activeNote = useActiveNoteStore((state) => state.activeNote);
  const blockOrder = activeNote?.blockOrder;
  const blocksById = activeNote?.blocksById ?? {};
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

  const { applyStyleToSelection } = useRichTextEditor(
    editorRef,
    applyDocumentOperations
  );

  useBlockStructureEditor(editorRef);

  const getBlockTypeById = useCallback(
    (blockId: string): BlockType | null => {
      const block = blocksById[blockId];
      if (!block) return null;

      return block.type;
    },
    [blocksById]
  );

  const handleChangeBlockType = useCallback((type: BlockType) => {
    console.log("change block type", type);
    // здесь потом будет логика изменения типа текущего блока
  }, []);

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
          tabIndex={0}
          className={styles.blocks_root}
        >
          {blockOrder?.map((id) => (
            <BaseBlock key={id} id={id} />
          ))}
        </div>

        <SelectionMenu
          editorRef={editorRef}
          applyStyleToSelection={applyStyleToSelection}
          getBlockTypeById={getBlockTypeById}
          onChangeBlockType={handleChangeBlockType}
        />
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