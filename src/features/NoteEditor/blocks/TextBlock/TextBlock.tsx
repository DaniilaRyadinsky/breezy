import React from "react";
import styles from "./TextBlock.module.css";
import { TextSegmentType } from "@/entities/note/model/blockTypes";
import TextSegment from "../TextSegment/TextSegment";
import { useContentEditable } from "../../contenteditable/useContentEtitable";
import { updateBlockContent } from "@/entities/note/model/storeOperations";

type TextBlockProps = {
  id: string;
  data: { text: TextSegmentType[] };
  editableRef: React.RefCallback<HTMLElement>;
};

export const TextBlock = ({ id, data, editableRef }: TextBlockProps) => {

  const {mergedRef} = useContentEditable(editableRef, data.text, 
    (newSegments) => {
      updateBlockContent(id, "text", { ...data, text: newSegments });
    }
  );


  return (
    <p
      id={id}
      className={styles.text}
      contentEditable
      suppressContentEditableWarning
      ref={mergedRef}
    >
      {data.text.map((item, index) => (
        <TextSegment key={`${id}-${index}`} {...item} />
      ))}
    </p>
  );
};