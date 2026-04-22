import clsx from 'clsx'
import { HeaderBlockType } from '@/entities/note/model/blockTypes'
import TextSegmentType from '../TextSegment/TextSegment'
import styles from './HeaderBlock.module.css'

const HeaderBlock = ({ id, data }: HeaderBlockType) => {
  const level = data?.level ?? 1;
  const text = data?.text_data?.text ?? [{style:"default", string: ""}];
  const isEmpty = text.length === 0 || text.every(item => item.string.length === 0);

  return (
    <h2
      id={id}
      className={clsx(styles.text, {
        [styles.h1]: level === 1,
        [styles.h2]: level === 2,
        [styles.h3]: level === 3,
        [styles.h4]: level === 4,
      })}
      data-block-content
    >
      {isEmpty
        ? <br />
        : text.map((item, index) => (
            <TextSegmentType key={index} {...item} />
          ))}
    </h2>
  );
};

export default HeaderBlock