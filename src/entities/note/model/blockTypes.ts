export type BlockType = "text" | "list" | "header" | "img" | "link" | "code" | "file" | "quote";
export type TextStyle = "default" | "bold" | "italic" | "underline";
export type ListType = "ordered" | "unordered" | "todo";
export type ListLevel = 1 | 2 | 3 | 4;
export type HeaderLevel = 1 | 2 | 3 | 4;

export type TextSegmentType = {
  style: TextStyle,
  string: string
}

export type BaseBlockType = {
  id: string,
  type: BlockType,
  pos: number,
}

export type TextBlockType = BaseBlockType & {
  type: "text",
  data: {
    text_data: {
      text: TextSegmentType[]
    },
  }
}

export type ListBlockType = BaseBlockType & {
  type: "list",
  data: {
    text_data: {
      text: TextSegmentType[]
    },
    level: ListLevel,
    type: ListType,
    value: number,
  }
}

export type HeaderBlockType = BaseBlockType & {
  type: "header",
  data: {
    text_data: {
      text: TextSegmentType[]
    },
    level: HeaderLevel,
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

export type RichTextBlock = TextBlockType | ListBlockType | HeaderBlockType;
export type PlainTextBlock = QuoteBlockType | CodeBlockType;

export type EditableTextBlock =
  RichTextBlock |
  PlainTextBlock;


export type Block =
  EditableTextBlock |
  ImgBlockType |
  LinkBlockType |
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

