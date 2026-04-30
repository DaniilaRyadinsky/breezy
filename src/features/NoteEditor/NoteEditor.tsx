import { BlocksRegistryProvider, useBlocksRegistry } from "@/features/navigation";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { applyDocumentOperations, insertBlock } from "@/entities/note/model/storeOperations";
import styles from "./NoteEditor.module.css";
import TableContents from "./ui/TableContents/TableContents";
import clsx from "clsx";
import MainTitle, { MainTitleHandle } from "./MainTitle/MainTitle";
import { useAppStore } from "@/shared/model/AppStore";
import { useRef, useCallback } from "react";
import { BaseBlock } from "./blocks/BaseBlock/BaseBlock";
import { SelectionMenu } from "../selectionMenu/ui/SelectionMenu";
import { BlockChangeType, getBlockChangeTypeFromBlock } from "@/entities/note/lib/blockChange";
import { useDocumentEditor } from "./hooks/useDocumentEditor";
import { usePendingSelection } from "./hooks/usePendingSelection";
import { useEditorBlockCreation } from "./hooks/useEditorBlockCreation";
import { SlashMenu } from "../slashMenu/ui/SlashMenu";

const NoteEditorContent = () => {
  const activeNote = useActiveNoteStore((state) => state.activeNote);
  const blockOrder = activeNote?.blockOrder;
  const blocksById = activeNote?.blocksById ?? {};
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);

  const titleRef = useRef<MainTitleHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { registerEditorRoot } = useBlocksRegistry();

  const setEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      editorRef.current = node;
      registerEditorRoot(node);
    },
    [registerEditorRoot]
  );

  const {
    applyStyleToSelection,
    isSlashMenuOpen,
    slashMenuAnchorEl,
    slashMenuBlockId,
    closeSlashMenu,
  } = useDocumentEditor(editorRef, applyDocumentOperations);

  const { setPendingSelection } = usePendingSelection(editorRef);
  const { createBlockAtEnd } = useEditorBlockCreation({
    editorRef,
    onPendingSelection: setPendingSelection,
  });

  const getBlockTypeById = useCallback(
    (blockId: string): BlockChangeType | null => {
      return getBlockChangeTypeFromBlock(blocksById[blockId]) ?? null;
    },
    [blocksById]
  );


  const handleBlocksRootClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!activeNote) return;

      const target = event.target as HTMLElement;
      const clickedBlock = target.closest<HTMLElement>("[data-block-id]");
      const clickedBlockType = clickedBlock?.dataset.blockType;

      if (clickedBlockType === "text") {
        return;
      }

      if (clickedBlock) {
        return;
      }

      createBlockAtEnd();
    },
    [activeNote, createBlockAtEnd]
  );


  return (
    <div className={styles.container}>
      <div
        className={clsx(styles.note_editor, {
          [styles.sidebar_mode]: isSidebarOpen,
        })}
      >
        <MainTitle
          ref={titleRef}
          onEnter={() => {
            editorRef.current?.focus()
          }} />

        <div
          ref={setEditorRef}
          contentEditable
          suppressContentEditableWarning
          tabIndex={0}
          className={styles.blocks_root}
          onClick={handleBlocksRootClick}
        >
          {blockOrder?.map((id) => (
            <BaseBlock key={id} id={id} />
          ))}
        </div>

        <SelectionMenu
          editorRef={editorRef}
          applyStyleToSelection={applyStyleToSelection}
          getBlockTypeById={getBlockTypeById}
        />
        <SlashMenu
          open={isSlashMenuOpen}
          anchorEl={slashMenuAnchorEl}
          blockId={slashMenuBlockId}
          currentBlockType={
            slashMenuBlockId ? getBlockTypeById(slashMenuBlockId) : null
          }
          onClose={closeSlashMenu}
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