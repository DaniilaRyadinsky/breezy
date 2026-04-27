import { ActiveNote } from "@/entities/note/model/noteTypes";
import { BlockOperation } from "@/entities/note/model/operationsType";
import { EditorSelection, PendingEditorSelection } from "../../lib/selection";
import { Block, RichTextBlock, TextStyle } from "@/entities/note/model/blockTypes";

export type CommitOperations = (
  operations: BlockOperation[],
  nextSelection: PendingEditorSelection
) => void;

export type DeleteSelectionFn = (
  note: ActiveNote,
  selection: EditorSelection
) => boolean;

export type BeforeInputContext<TBlock> = {
  event: InputEvent;
  note: ActiveNote;
  block: TBlock;
  selection: EditorSelection;
  commitOperations: CommitOperations;
  deleteSelection: DeleteSelectionFn;
};

export type KeyDownContext<TBlock> = {
  event: KeyboardEvent;
  note: ActiveNote;
  block: TBlock;
  selection: EditorSelection;
  commitOperations: CommitOperations;
  deleteSelection: DeleteSelectionFn;
};

export type PasteContext<TBlock> = {
  event: ClipboardEvent;
  note: ActiveNote;
  block: TBlock;
  selection: EditorSelection;
  commitOperations: CommitOperations;
  deleteSelection: DeleteSelectionFn;
};

export type ApplyStyleContext<TBlock> = {
  note: ActiveNote;
  block: TBlock;
  selection: EditorSelection;
  style: TextStyle;
  commitOperations: CommitOperations;
};

export type ApplyStyleBehaviorContext =
  Omit<BlockBehaviorContext<RichTextBlock>, "event"> & {
    style: TextStyle;
  };

export type BlockBehaviorContext<TBlock extends Block = Block, TEvent = KeyboardEvent | InputEvent | ClipboardEvent> = {
  event: TEvent;
  note: ActiveNote;
  block: TBlock;
  selection: EditorSelection;
  commitOperations: (
    operations: BlockOperation[],
    nextSelection: PendingEditorSelection
  ) => void;
  deleteSelection: (
    note: ActiveNote,
    selection: EditorSelection
  ) => boolean;
};

export type BlockBehavior<TBlock extends Block = Block> = {
  onBeforeInput?: (ctx: BlockBehaviorContext<TBlock, InputEvent>) => boolean;
  onKeyDown?: (ctx: BlockBehaviorContext<TBlock, KeyboardEvent>) => boolean;
  onPaste?: (ctx: BlockBehaviorContext<TBlock, ClipboardEvent>) => boolean;

  insertText?: (
    ctx: BlockBehaviorContext<TBlock, InputEvent>,
    text: string
  ) => boolean;

  deleteBackward?: (
    ctx: BlockBehaviorContext<TBlock, KeyboardEvent>
  ) => boolean;

  deleteForward?: (
    ctx: BlockBehaviorContext<TBlock, KeyboardEvent>
  ) => boolean;

  pressEnter?: (
    ctx: BlockBehaviorContext<TBlock, KeyboardEvent>
  ) => boolean;

  applyStyleToSelection?: TBlock extends RichTextBlock
  ? (ctx: ApplyStyleBehaviorContext) => boolean
  : never;
};