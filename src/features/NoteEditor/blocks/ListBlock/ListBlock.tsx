import type { ListBlockType } from '@/entities/note/model/blockTypes';
import styles from './ListBlock.module.css'
import TextSegment from '../TextSegment/TextSegment';

const ListBlock = ({ id, data }: ListBlockType) => {
  const {
    text_data,
    level,
    type,
    value,
  } = data;

  function GetSign() {
    switch (type) {
      case 'unordered':
        return <svg fill="none" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="2.5" fill="var(--md-sys-color-primary)" />
        </svg>;
      case 'ordered':
        return <>{value + '.'}</>
      case 'todo':
        return <div></div>
    }
  }

  const tabStyle = {
    marginLeft: 20 * level + "px"
  }

  return (
    <div className={styles.list_container} style={tabStyle}>
      <div className={styles.list_sign} contentEditable={false} data-block-sign>
        {GetSign()}
      </div>
      <p className={styles.text} data-block-content>
        {text_data.text.every((item) => item.string.length === 0) ? (
          <br />
        ) : (
          text_data.text.map((item, index) => (
            <TextSegment key={index} {...item} />
          ))
        )}
      </p>
    </div>
  );
}

export default ListBlock