import styles from "./TextBlock.module.css";
import { TextBlockType } from "@/entities/note/model/blockTypes";
import TextSegment from "../TextSegment/TextSegment";

export const TextBlock = ({ id, data }: TextBlockType) => {

  const text = data?.text_data?.text ?? [{style:"default", string: ""}];

  return (
    <p
      id={id}
      className={styles.text}
      data-block-content
    >
      {text.every((item) => item.string.length === 0) ? (
          <br />
        ) : (
          text.map((item, index) => (
            <TextSegment key={index} {...item} />
          ))
        )}
    </p>
  );
};