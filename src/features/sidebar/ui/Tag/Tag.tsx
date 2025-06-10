import styles from './Tag.module.css'

export const enum TagColor {
    Red,
    Yellow,
    Green,
    LightGreen,
    Teal,
    Violet,
    Blue,
    Gray
}

const TAG_COLORS = {
    [TagColor.Red]: {
        bg: 'var(--tag-red)',
        text: 'var(--on-tag-red)'
    },
    [TagColor.Yellow]: {
        bg: '#var(--tag-yellow)',
        text: '#var(--on-tag-yellow)'
    },
    [TagColor.Green]: {
        bg: 'var(--tag-green)',
        text: 'var(--on-tag-green)'
    },
    [TagColor.LightGreen]: {
        bg: 'var(--tag-light-green)',
        text: 'var(--on-tag-light-green)'
    },
    [TagColor.Teal]: {
        bg: 'var(--tag-teal)',
        text: 'var(--on-tag-teal)'
    },
    [TagColor.Violet]: {
        bg: 'var(--tag-violet)',
        text: 'var(--on-tag-violet)'
    },
    [TagColor.Blue]: {
        bg: 'var(--tag-blue)',
        text: 'var(--on-tag-blue)'
    },
    [TagColor.Gray]: {
        bg: 'var(--tag-gray)',
        text: 'var(--on-tag-gray)'
    }
};


export interface ITag {
    color: TagColor,
    text: string
}

export const Tag = ({ color, text }: ITag) => {
    const colors = TAG_COLORS[color];

    return (
        <div style={{backgroundColor: colors.bg}} className={styles.tag}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_247_230)">
                    <path fill={colors.text} d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3ZM17 18L12 15.82L7 18V6C7 5.45 7.45 5 8 5H16C16.55 5 17 5.45 17 6V18Z" />
                </g>
                <defs>
                    <clipPath id="clip0_247_230">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
            <p className={styles.tag_text} style={{color: colors.text}}>{text}</p>
        </div>
    )
}
