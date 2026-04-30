import { ImgBlockType } from "@/entities/note/model/blockTypes";
import styles from "./ImageBlock.module.css";
import { BASE_URL } from "@/shared/consts";

export const ImageBlock = ({ data }: ImgBlockType) => {
  const src = data?.src ?? "";

  if (!src) {
    return (
      <div className={styles.placeholder}
        contentEditable={false}
        data-void-block="true">
        <span>Изображение</span>
      </div>
    );
  }

  return (
    <div className={styles.container} contentEditable={false} data-void-block="true">
      <img 
      src={`${BASE_URL}${src}`} 
      alt={ "НЕТ ИЗОБРАЖЕНИЯ"} 
      className={styles.image} 
      draggable={false}
      />
    </div>
  );
};