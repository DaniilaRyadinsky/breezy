import { BlockChangeType } from "./blockChangeTypes";
import { TextStyle, ListType, HeaderLevel, BlockType, Block } from "./blockTypes";

export type RichTextBlockType = "text" | "list" | "header";
export type PlainTextBlockType = "quote" | "code";

export type BaseOperation<TOp extends string, TData> = {
  op: TOp;
  data: TData;
  block_id: string;
  note_id: string;
};

export type TypedBlockOperation<
  TOp extends string,
  TBlockType extends RichTextBlockType | PlainTextBlockType,
  TData
> = BaseOperation<TOp, TData> & {
  block_type: TBlockType;
};

/* -------------------- Операции создания и удаления -------------------- */
export type CreateBlockOp = BaseOperation<
  "create_block",
  { block: Block; pos: number }
>;

export type DeleteBlockOp = BaseOperation<
  "delete_block",
  {}
>;

export type ChangeBlockTypeOp = BaseOperation<
  "change_block_type",
  { new_type: BlockChangeType }
>;

/* -------------------- Общие текстовые операции -------------------- */

export type InsertTextOp<T extends RichTextBlockType | PlainTextBlockType = RichTextBlockType | PlainTextBlockType> = TypedBlockOperation<
  "insert_text",
  T,
  { pos: number; new_text: string }
>;

export type DeleteRangeOp<T extends RichTextBlockType | PlainTextBlockType = RichTextBlockType | PlainTextBlockType> = TypedBlockOperation<
  "delete_range",
  T,
  { start: number; end: number }
>;

export type ApplyStyleOp<
  T extends RichTextBlockType | PlainTextBlockType = RichTextBlockType | PlainTextBlockType
> = TypedBlockOperation<
  "apply_style",
  T,
  {
    start: number;
    end: number;
    style: TextStyle;
  }
>;

export type RichTextOperation =
  | InsertTextOp<RichTextBlockType>
  | DeleteRangeOp<RichTextBlockType>
  | ApplyStyleOp<RichTextBlockType>;

export type PlainTextEditOperation =
  | InsertTextOp<PlainTextBlockType>
  | DeleteRangeOp<PlainTextBlockType>;

export type TextEditOperation =
  | RichTextOperation
  | PlainTextEditOperation;

/* -------------------- Общие field-операции -------------------- */

export type ChangeTextOp = BaseOperation<
  "change_text",
  { new_text: string }
>;

export type ChangeSrcOp = BaseOperation<
  "change_src",
  { new_src: string }
>;

export type ChangeAltOp = BaseOperation<
  "change_alt",
  { new_alt: string }
>;

export type ChangeUrlOp = BaseOperation<
  "change_url",
  { new_url: string }
>;

export type ChangeLevelOp<TLevel extends number = number> = BaseOperation<
  "change_level",
  { new_level: TLevel }
>;

export type ChangeValueOp = BaseOperation<
  "change_value",
  { new_value: number }
>;

export type ChangeListTypeOp = BaseOperation<
  "change_type",
  { new_type: ListType }
>;

export type AnalyseLangOp = BaseOperation<
  "analyse_lang",
  {}
>;

/* -------------------- Операции по типам блоков -------------------- */

export type TextBlockOperation =
  | InsertTextOp<"text">
  | DeleteRangeOp<"text">
  | ApplyStyleOp<"text">;

export type ListBlockOperation =
  | InsertTextOp<"list">
  | DeleteRangeOp<"list">
  | ApplyStyleOp<"list">
  | ChangeLevelOp<number>
  | ChangeValueOp
  | ChangeListTypeOp;

export type HeaderBlockOperation =
  | InsertTextOp<"header">
  | DeleteRangeOp<"header">
  | ApplyStyleOp<"header">
  | ChangeLevelOp<HeaderLevel>;

export type QuoteBlockOperation =
  | InsertTextOp<"quote">
  | DeleteRangeOp<"quote">;

export type CodeBlockOperation =
  | InsertTextOp<"code">
  | DeleteRangeOp<"code">
  | AnalyseLangOp;

export type ImgBlockOperation =
  | ChangeSrcOp
  | ChangeAltOp;

export type LinkBlockOperation =
  | ChangeTextOp
  | ChangeUrlOp;

export type FileBlockOperation =
  ChangeSrcOp;

export type BlockOperationByType = {
  text: TextBlockOperation;
  list: ListBlockOperation;
  header: HeaderBlockOperation;
  img: ImgBlockOperation;
  link: LinkBlockOperation;
  quote: QuoteBlockOperation;
  code: CodeBlockOperation;
  file: FileBlockOperation;
};

export type OperationFor<T extends BlockType> = BlockOperationByType[T];
export type AnyBlockOperation = BlockOperationByType[BlockType];

export type BlockOperation =
  | CreateBlockOp
  | DeleteBlockOp
  | ChangeBlockTypeOp
  | AnyBlockOperation;