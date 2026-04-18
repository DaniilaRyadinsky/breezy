import styles from "./TextBlock.module.css";
import { TextBlockType } from "@/entities/note/model/blockTypes";
import TextSegment from "../TextSegment/TextSegment";

export const TextBlock = ({ id, data }: TextBlockType) => {
  return (
    <p
      id={id}
      className={styles.text}
    >
      {data.text_data?.text.map((item, index) => (
        <TextSegment key={`${id}-${index}`} {...item} />
      ))}
    </p>
  );
};