import TagIcon from '../../../shared/ui/icons/TagIcon';
import { getTagStyles, TagColor } from '../model/types';
import styles from './Tag.module.css'




export interface ITag {
    color: TagColor,
    text: string
}

export const TagChip = ({ color, text }: ITag) => {
    const colors = getTagStyles(color);

    return (
        <div style={{backgroundColor: colors.bg}} className={styles.tag_chip}>
            <TagIcon color={colors.text}/>
            <p className={styles.tag_text} style={{color: colors.text}}>{text}</p>
        </div>
    )
}
