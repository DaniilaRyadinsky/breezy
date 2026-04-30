import { ImgBlockType } from "@/entities/note/model/blockTypes";
import styles from "./ImageBlock.module.css";
import { BASE_URL } from "@/shared/consts";

export const ImageBlock = ({ data }: ImgBlockType) => {
  const src = data?.src ?? "";

  if (!src) {
    return (
      <div className={styles.placeholder} tabIndex={0} contentEditable={false}>
        <span>Изображение</span>
      </div>
    );
  }

  return (
    <div className={styles.container} tabIndex={0} contentEditable={false}>
      <img src={`${BASE_URL}${src}`} alt={ "НЕТ ИЗОБРАЖЕНИЯ"} className={styles.image} />
    </div>
  );
};