import { FileBlockType } from "@/entities/note/model/blockTypes";
import { FileText, X } from "lucide-react";
import styles from "./FileBlock.module.css";
import { deleteBlock } from "@/entities/note/model/storeOperations";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { deleteFile } from "@/shared/api/uploadFile";

export const FileBlock = ({ id, data }: FileBlockType) => {
  const src = data?.src ?? "";
  const noteId = useActiveNoteStore((state) => state.activeNote?.id);

  const handleDelete = () => {
    if (noteId) {
      deleteFile(src);
      deleteBlock(id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.fileCard}>
        <div className={styles.iconContainer}>
          <FileText size={32} className={styles.icon} />
        </div>
        <div className={styles.fileName}>
          {src ? src.split("/").pop() : "Файл"}
        </div>
        <button className={styles.deleteButton} onClick={handleDelete}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};