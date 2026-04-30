import { BlockChangeType } from "./blockChangeTypes";
import {
  TextStyle,
  ListType,
  HeaderLevel,
  BlockType,
  Block,
} from "./blockTypes";

export type RichTextBlockType = "text" | "list" | "header";
export type PlainTextBlockType = "quote" | "code";

export type BaseOperation<TOp extends string, TData> = {
  op: TOp;
  data: TData;
  block_id: string;
  note_id: string;
};

export type BlockScopedOperation<
  TOp extends string,
  TBlockType extends BlockType,
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

export type ChangeBlockTypeOp = BlockScopedOperation<
  "change_block_type",
  BlockType,
  { new_type: BlockChangeType }
>;

/* -------------------- Текстовые операции -------------------- */

export type InsertTextOp<
  T extends RichTextBlockType | PlainTextBlockType =
    RichTextBlockType | PlainTextBlockType
> = BlockScopedOperation<
  "insert_text",
  T,
  { pos: number; new_text: string }
>;

export type DeleteRangeOp<
  T extends RichTextBlockType | PlainTextBlockType =
    RichTextBlockType | PlainTextBlockType
> = BlockScopedOperation<
  "delete_range",
  T,
  { start: number; end: number }
>;

export type ApplyStyleOp<
  T extends RichTextBlockType = RichTextBlockType
> = BlockScopedOperation<
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

/* -------------------- Field-операции -------------------- */

export type ChangeTextOp = BlockScopedOperation<
  "change_text",
  "link",
  { new_text: string }
>;

export type ChangeImgSrcOp = BlockScopedOperation<
  "change_src",
  "img",
  { new_src: string }
>;

export type ChangeFileSrcOp = BlockScopedOperation<
  "change_src",
  "file",
  { new_src: string }
>;

export type ChangeSrcOp =
  | ChangeImgSrcOp
  | ChangeFileSrcOp;

export type ChangeAltOp = BlockScopedOperation<
  "change_alt",
  "img",
  { new_alt: string }
>;

export type ChangeUrlOp = BlockScopedOperation<
  "change_url",
  "link",
  { new_url: string }
>;



export type ChangeLevelOp = BlockScopedOperation<
  "change_level",
  "list",
  { new_level: number }
>;

export type ChangeValueOp = BlockScopedOperation<
  "change_value",
  "list",
  { new_value: number }
>;

export type ChangeListTypeOp = BlockScopedOperation<
  "change_type",
  "list",
  { new_type: ListType }
>;

export type AnalyseLangOp = BlockScopedOperation<
  "analyse_lang",
  "code",
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
  | ChangeLevelOp
  | ChangeValueOp
  | ChangeListTypeOp;

export type HeaderBlockOperation =
  | InsertTextOp<"header">
  | DeleteRangeOp<"header">
  | ApplyStyleOp<"header">

export type QuoteBlockOperation =
  | InsertTextOp<"quote">
  | DeleteRangeOp<"quote">;

export type CodeBlockOperation =
  | InsertTextOp<"code">
  | DeleteRangeOp<"code">
  | AnalyseLangOp;

export type ImgBlockOperation =
  | ChangeImgSrcOp
  | ChangeAltOp;

export type LinkBlockOperation =
  | ChangeTextOp
  | ChangeUrlOp;

export type FileBlockOperation =
  ChangeFileSrcOp;

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