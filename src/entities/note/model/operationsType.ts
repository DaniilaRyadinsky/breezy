import { TextStyle, ListType, HeaderLevel, BlockType, Block } from "./blockTypes";

export type BaseOperation<TOp extends string, TData> = {
  op: TOp;
  data: TData;
  block_id: string;
  note_id: string;
};

/* -------------------- Операции создания и удаления -------------------- */
export type CreateBlockOp = BaseOperation<
  "create_block", { block: Block; pos: number; }>;

export type DeleteBlockOp = BaseOperation<
  "delete_block", {}>;

/* -------------------- Общие текстовые операции -------------------- */

export type InsertTextOp = BaseOperation<
  "insert_text", { pos: number; new_text: string; }>;

export type DeleteRangeOp = BaseOperation<
  "delete_range", { start: number; end: number; }>;

export type ApplyStyleOp = BaseOperation<
  "apply_style",
  {
    start: number;
    end: number;
    style: TextStyle;
  }
>;

export type RichTextOperation =
  | InsertTextOp
  | DeleteRangeOp
  | ApplyStyleOp;

/* -------------------- Общие field-операции -------------------- */

export type ChangeTextOp = BaseOperation<
  "change_text", { new_text: string; }>;

export type ChangeSrcOp = BaseOperation<
  "change_src", { new_src: string; }>;

export type ChangeAltOp = BaseOperation<
  "change_alt", { new_alt: string; }>;

export type ChangeUrlOp = BaseOperation<
  "change_url", { new_url: string; }>;

export type ChangeLevelOp<TLevel extends number = number> = BaseOperation<
  "change_level", { new_level: TLevel; }>;

export type ChangeValueOp = BaseOperation<
  "change_value", { new_value: number; }>;

export type ChangeListTypeOp = BaseOperation<
  "change_type", { new_type: ListType; }>;

export type AnalyseLangOp = BaseOperation<
  "analyse_lang", {}>;

/* -------------------- Операции по типам блоков -------------------- */

export type TextBlockOperation =
  RichTextOperation;

export type ListBlockOperation =
  | RichTextOperation
  | ChangeLevelOp<number>
  | ChangeValueOp
  | ChangeListTypeOp;

export type HeaderBlockOperation =
  | RichTextOperation
  | ChangeLevelOp<HeaderLevel>;

export type ImgBlockOperation =
  | ChangeSrcOp
  | ChangeAltOp;

export type LinkBlockOperation =
  | ChangeTextOp
  | ChangeUrlOp;

export type QuoteBlockOperation =
  ChangeTextOp;

export type CodeBlockOperation =
  | ChangeTextOp
  | AnalyseLangOp;

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
  | AnyBlockOperation;
