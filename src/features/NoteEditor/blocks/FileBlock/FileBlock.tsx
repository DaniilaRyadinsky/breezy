import { FileBlockType } from "@/entities/note/model/blockTypes";
import { FileText, X } from "lucide-react";
import styles from "./FileBlock.module.css";
import { deleteBlock } from "@/entities/note/model/storeOperations";
import { useActiveNoteStore } from "@/entities/note/model/store";
import { deleteFile } from "@/shared/api/uploadFile";
import { BASE_URL } from "@/shared/consts";

export const FileBlock = ({ id, data }: FileBlockType) => {
  const src = data?.src ?? "";
  const noteId = useActiveNoteStore((state) => state.activeNote?.id);

  const fileName = src ? src.split("/").pop() ?? "file" : "Файл";

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (noteId) {
      deleteFile(src);
      deleteBlock(id);
    }
  };

  return (
    <div
      className={styles.container}
      contentEditable={false}
      data-void-block="true"
    >
      <a
        className={styles.fileCard}
        href={`${BASE_URL}${src}`}
        download={fileName}
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.iconContainer}>
          <FileText size={32} className={styles.icon} />
        </div>

        <div className={styles.fileName}>
          {fileName}
        </div>

        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
        >
          <X size={16} />
        </button>
      </a>
    </div>
  );
};