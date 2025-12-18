export enum StyleText {
    Bold,
    Normal,
    Italic //стили не все
}

export enum BlockTypes {
    Paragraph,
    Header,
    List,
    Code,
    Quote,
    Link,
    File //пока достаточно
}

export interface ITextSegment {
    style: StyleText,
    text: string
}

export interface IBaseBlock {
    id: string,
    type: BlockTypes,
    content: ITextSegment[];
}

export interface IParagraph extends IBaseBlock {
    type: BlockTypes.Paragraph,
}

export interface IQuote extends IBaseBlock {
    type: BlockTypes.Quote,
}

export interface IHeader extends IBaseBlock {
    type: BlockTypes.Header,
    level: 1 | 2 | 3 | 4
}

export enum ListModes {
    Ordered,
    Unordered,
    Todo
}

export interface IList extends IBaseBlock {
    type: BlockTypes.List,
    tabs: number,
    mode: ListModes,
    checked: number | null
}

export type Block = IParagraph | IHeader | IList | IQuote
