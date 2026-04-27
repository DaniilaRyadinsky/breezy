export type CaretSelection = {
  start: number;
  end: number;
};

export type EditorPoint = {
  blockId: string;
  offset: number;
};

export type EditorSelection = {
  start: EditorPoint;
  end: EditorPoint;
};

export type PendingEditorSelection = EditorSelection;

export type SingleBlockSelection = CaretSelection & {
  blockId: string;
  blockEl: HTMLElement;
};


export function isCollapsedEditorSelection(selection: EditorSelection): boolean {
  return (
    selection.start.blockId === selection.end.blockId &&
    selection.start.offset === selection.end.offset
  );
}