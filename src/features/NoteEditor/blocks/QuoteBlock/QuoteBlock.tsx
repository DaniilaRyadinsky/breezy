import { QuoteBlockType } from "@/entities/note/model/blockTypes";
import { Quote } from "lucide-react";
import styles from "./QuoteBlock.module.css";

export const QuoteBlock = ({ id, data }: QuoteBlockType) => {
  const text = data?.text ?? "";

  return (
    <div className={styles.container}>
      <div className={styles.quoteCard}>
        <div className={styles.quoteIcon}>
          <Quote size={20} />
        </div>
        <div className={styles.quoteText}>
          {text || "Цитата"}
        </div>
      </div>
    </div>
  );
};