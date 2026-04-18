import styles from "./TextBlock.module.css";
import { TextSegmentType } from "@/entities/note/model/blockTypes";
import TextSegment from "../TextSegment/TextSegment";

type TextBlockProps = {
  id: string;
  data: { text: TextSegmentType[] };
};

export const TextBlock = ({ id, data }: TextBlockProps) => {
  return (
    <p
      id={id}
      className={styles.text}
    >
      {data.text?.map((item, index) => (
        <TextSegment key={`${id}-${index}`} {...item} />
      ))}
    </p>
  );
};