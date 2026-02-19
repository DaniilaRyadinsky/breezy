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
    is_used: boolean,
    note_id: string,
    order: number,
    created_at: number,
    updated_at: number,
}

export interface IParagraph extends IBaseBlock {
    type: BlockTypes.Paragraph,
    data: {
        text: ITextSegment[]
    }
}

export interface IQuote extends IBaseBlock {
    type: BlockTypes.Quote,
    data: {
        text: ITextSegment[]
    }
}

export interface IHeader extends IBaseBlock {
    type: BlockTypes.Header,
    level: 1 | 2 | 3 | 4
    data: {
        text: ITextSegment[]
    }
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

export type Note = {
    id: null | string;
    author: string,
    editors: string[],
    readers: string[],
    title: string;
    created_at: number,
    updated_at: number,
    tag: undefined,
    blocks: Block[],
}
