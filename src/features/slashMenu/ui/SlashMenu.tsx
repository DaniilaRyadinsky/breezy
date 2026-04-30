import { useMemo, useRef } from "react";

import { applyDocumentOperations, changeBlockType } from "@/entities/note/model/storeOperations";
import type { BlockChangeType } from "@/entities/note/model/blockChangeTypes";
import {
  toBlockChangeTarget,
} from "@/entities/note/model/blockChangeTypes";
import { getAvailableBlockTypes } from "@/entities/note/lib/blockConversion";
import { BLOCK_OPTIONS } from "@/shared/consts/blockMenuOptions";
import { BlockTypeMenu } from "@/shared/ui/BlockTypeMenu/BlockTypeMenu";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { uploadFile } from "@/shared/api/uploadFile";



type SlashMenuProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  blockId: string | null;
  currentBlockType: BlockChangeType | null;
  onClose: () => void;
};

export const SlashMenu = ({
  open,
  anchorEl,
  blockId,
  currentBlockType,
  onClose,
}: SlashMenuProps) => {

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const availableBlockOptions = useMemo(() => {
    if (!currentBlockType) return BLOCK_OPTIONS;

    const baseType = toBlockChangeTarget(currentBlockType).type;
    const allowed = new Set(getAvailableBlockTypes(baseType));

    return BLOCK_OPTIONS.filter((item) => allowed.has(item.type));
  }, [currentBlockType]);

  const pendingFileBlockIdRef = useRef<string | null>(null);

  const handleSelect = (type: BlockChangeType) => {
    if (!blockId) return;

    if (type === "img") {
      pendingFileBlockIdRef.current = blockId;
      onClose();

      requestAnimationFrame(() => {
        imageInputRef.current?.click();
      });

      return;
    }

    if (type === "file") {
      pendingFileBlockIdRef.current = blockId;
      onClose();

      requestAnimationFrame(() => {
        fileInputRef.current?.click();
      });

      return;
    }

    changeBlockType(blockId, type);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'img' | 'file') => {
    const file = e.target.files?.[0];
    const targetBlockId = pendingFileBlockIdRef.current;

    pendingFileBlockIdRef.current = null;
    e.target.value = "";

    if (!file || !targetBlockId) return;

    const noteId = useActiveNoteStore.getState().activeNote?.id;
    if (!noteId) return;

    try {
      const { name } = await uploadFile(file);

      changeBlockType(targetBlockId, type);

      applyDocumentOperations(noteId, [
        {
          op: "change_src",
          note_id: noteId,
          block_id: targetBlockId,
          data: {
            new_src: `files/${name}`,
          },
        },
      ]);
    } catch (error) {
      console.error("Не удалось загрузить файл", error);
    }
  };


  return (
    <>
      <BlockTypeMenu
        open={open}
        anchorEl={anchorEl}
        options={availableBlockOptions}
        selectedType={currentBlockType}
        onClose={onClose}
        onSelect={handleSelect}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFileChange(e, "img")}
      />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(e) => handleFileChange(e, "file")}
      />
    </>
  );
};