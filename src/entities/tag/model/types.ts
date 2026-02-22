export type Tag = {
    id: string,
    title: string,
    color: TagColor,
    emoji: string
}

export const TAG_COLOR_NAMES = [
  'red',
  'yellow',
  'green',
  'light_green',
  'teal',
  'violet',
  'blue',
  'gray',
] as const;


export type TagColor = typeof TAG_COLOR_NAMES[number];

export const TAG_COLORS: Record<TagColor, { bg: string; text: string; }> = {
  red: {
    bg: 'var(--tag-red)',
    text: 'var(--on-tag-red)',
  },
  yellow: {
    bg: 'var(--tag-yellow)',
    text: 'var(--on-tag-yellow)',
  },
  green: {
    bg: 'var(--tag-green)',
    text: 'var(--on-tag-green)',
  },
  light_green: {
    bg: 'var(--tag-light-green)',
    text: 'var(--on-tag-light-green)',
  },
  teal: {
    bg: 'var(--tag-teal)',
    text: 'var(--on-tag-teal)',
  },
  violet: {
    bg: 'var(--tag-violet)',
    text: 'var(--on-tag-violet)',
  },
  blue: {
    bg: 'var(--tag-blue)',
    text: 'var(--on-tag-blue)',
  },
  gray: {
    bg: 'var(--tag-gray)',
    text: 'var(--on-tag-gray)',
  },
};

type TagStyle = { bg: string; text: string; };

export const getTagStyles = (color: TagColor): TagStyle => {
  return TAG_COLORS[color]; 
};