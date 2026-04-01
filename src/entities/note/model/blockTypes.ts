export enum StyleText {
  Bold,
  Normal,
  Italic //стили не все
}


export type BlockType = "text" | "list" | "header" | "img" | "link" | "code" | "file" | "quote";

export type TextSegmentType = {
  style: StyleText,
  text: string
}

export type BaseBlockType = {
  id: string,
  type: BlockType,
  pos: number,
}

export type TextBlockType = BaseBlockType & {
  type: "text",
  data: {
    text: TextSegmentType[],
  }
}

export type ListBlockType = BaseBlockType & {
  type: "list",
  data: {
    text_data: TextSegmentType[],
    level: 1 | 2 | 3 | 4,
    type: "ordered" | "unordered" | "todo",
    value: number,
  }
}

export type HeaderBlockType = BaseBlockType & {
  type: "header",
  data: {
    text_data: TextSegmentType[],
    level: 1 | 2 | 3 | 4,
  }
}

export type ImgBlockType = BaseBlockType & {
  type: "img",
  data: {
    alt: string,
    src: string,
  }
}

export type LinkBlockType = BaseBlockType & {
  type: "link",
  data: {
    text: string,
    url: string,
  }
}

export type QuoteBlockType = BaseBlockType & {
  type: "quote",
  data: {
    text: string,
  }
}

export type CodeBlockType = BaseBlockType & {
  type: 'code',
  data: {
    text: string,
    lang: string
  }
}

export type FileBlockType = BaseBlockType & {
  type: "file",
  data: {
    src: string,
  }
}


export type Block =
  TextBlockType |
  ListBlockType |
  HeaderBlockType |
  ImgBlockType |
  LinkBlockType |
  QuoteBlockType |
  CodeBlockType |
  FileBlockType;

  type BlockMap = {
    text: TextBlockType;
    list: ListBlockType;
    header: HeaderBlockType;
    img: ImgBlockType;
    link: LinkBlockType;
    quote: QuoteBlockType;
    code: CodeBlockType;
    file: FileBlockType;
  };
  
  export type BlockByType<T extends BlockType> = BlockMap[T];
  export type BlockDataByType<T extends BlockType> = BlockMap[T]["data"];