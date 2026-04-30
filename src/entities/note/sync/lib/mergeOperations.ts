import { BlockType } from "../../model/blockTypes";
import { toBlockChangeTarget } from "../../model/blockChangeTypes";
import {
  BlockOperation,
  RichTextOperation,
  PlainTextEditOperation,
  TextEditOperation,
  CreateBlockOp,
  DeleteBlockOp,
  ChangeBlockTypeOp,
  ChangeTextOp,
  AnalyseLangOp,
  ChangeSrcOp,
  ChangeAltOp,
  ChangeUrlOp,
  ChangeLevelOp,
  ChangeValueOp,
  ChangeListTypeOp,
  RichTextBlockType,
  PlainTextBlockType,
} from "../../model/operationsType";
import { SyncType } from "../model/syncTypes";

function findLast<T, S extends T>(
  arr: T[],
  predicate: (item: T) => item is S
): S | undefined;

function findLast<T>(
  arr: T[],
  predicate: (item: T) => boolean
): T | undefined;

function findLast<T>(
  arr: T[],
  predicate: (item: T) => boolean
): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return arr[i];
  }

  return undefined;
}

const findLastIndex = <T,>(
  arr: T[],
  predicate: (item: T) => boolean
): number => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }

  return -1;
};

const isCreateOp = (op: BlockOperation): op is CreateBlockOp => {
  return op.op === "create_block";
};

const isDeleteOp = (op: BlockOperation): op is DeleteBlockOp => {
  return op.op === "delete_block";
};

const isChangeBlockTypeOp = (
  op: BlockOperation
): op is ChangeBlockTypeOp => {
  return op.op === "change_block_type";
};

const isRichTextBlockType = (
  type: BlockType
): type is RichTextBlockType => {
  return type === "text" || type === "list" || type === "header";
};

const isPlainTextBlockType = (
  type: BlockType
): type is PlainTextBlockType => {
  return type === "quote" || type === "code";
};

type InsertDeleteOp = Extract<
  BlockOperation,
  { op: "insert_text" | "delete_range" }
>;

const isInsertDeleteOp = (
  op: BlockOperation
): op is InsertDeleteOp => {
  return op.op === "insert_text" || op.op === "delete_range";
};

const isPlainTextEditOp = (
  op: BlockOperation
): op is PlainTextEditOperation => {
  return isInsertDeleteOp(op) && isPlainTextBlockType(op.block_type);
};

const isRichTextOp = (
  op: BlockOperation
): op is RichTextOperation => {
  if (op.op === "apply_style") {
    return isRichTextBlockType(op.block_type);
  }

  return isInsertDeleteOp(op) && isRichTextBlockType(op.block_type);
};

type BlockOperationWithBlockType = Extract<
  BlockOperation,
  { block_type: BlockType }
>;

const hasBlockType = (
  op: BlockOperation
): op is BlockOperationWithBlockType => {
  return "block_type" in op;
};

const getFinalBlockTypeFromOps = (
  ops: BlockOperation[]
): BlockType | null => {
  const lastChangeBlockType = findLast(ops, isChangeBlockTypeOp);

  if (lastChangeBlockType) {
    return toBlockChangeTarget(lastChangeBlockType.data.new_type).type;
  }

  const lastTypedOp = findLast(ops, hasBlockType);

  return lastTypedOp?.block_type ?? null;
};

const makeCompactedSync = (
  payload: BlockOperation,
  source: SyncType[]
): SyncType => {
  const retryCounts = source.map((x) => x.retryCount);
  const createdAts = source.map((x) => x.createdAt);
  const nextAttemptAts = source.map((x) => x.nextAttemptAt);

  return {
    opId: crypto.randomUUID(),
    status: "pending",
    retryCount: retryCounts.length > 0 ? Math.max(...retryCounts) : 0,
    lastError: undefined,
    payload,
    createdAt: createdAts.length > 0 ? Math.min(...createdAts) : Date.now(),
    nextAttemptAt:
      nextAttemptAts.length > 0 ? Math.min(...nextAttemptAts) : Date.now(),
  };
};

const mergeAdjacentStyles = (
  ops: TextEditOperation[]
): TextEditOperation[] => {
  const result: TextEditOperation[] = [];

  for (const op of ops) {
    const last = result[result.length - 1];

    if (
      last &&
      last.op === "apply_style" &&
      op.op === "apply_style" &&
      last.data.style === op.data.style &&
      op.block_id === last.block_id &&
      op.note_id === last.note_id &&
      op.data.start <= last.data.end
    ) {
      last.data.end = Math.max(last.data.end, op.data.end);
      continue;
    }

    result.push(structuredClone(op));
  }

  return result;
};

const compressTextEditOps = (
  ops: TextEditOperation[]
): TextEditOperation[] => {
  const result: TextEditOperation[] = [];

  for (const current of ops) {
    const last = result[result.length - 1];

    if (!last) {
      result.push(structuredClone(current));
      continue;
    }

    if (last.op === "insert_text" && current.op === "insert_text") {
      const lastStart = last.data.pos;
      const lastEnd = last.data.pos + last.data.new_text.length;
      const curPos = current.data.pos;

      if (curPos === lastEnd) {
        last.data.new_text += current.data.new_text;
        continue;
      }

      if (curPos >= lastStart && curPos <= lastEnd) {
        const offset = curPos - lastStart;

        last.data.new_text =
          last.data.new_text.slice(0, offset) +
          current.data.new_text +
          last.data.new_text.slice(offset);

        continue;
      }
    }

    if (last.op === "insert_text" && current.op === "delete_range") {
      const insStart = last.data.pos;
      const insEnd = last.data.pos + last.data.new_text.length;
      const delStart = current.data.start;
      const delEnd = current.data.end;

      if (delStart >= insStart && delEnd <= insEnd) {
        const relStart = delStart - insStart;
        const relEnd = delEnd - insStart;

        last.data.new_text =
          last.data.new_text.slice(0, relStart) +
          last.data.new_text.slice(relEnd);

        if (last.data.new_text.length === 0) {
          result.pop();
        }

        continue;
      }
    }

    if (last.op === "delete_range" && current.op === "delete_range") {
      const aStart = last.data.start;
      const aEnd = last.data.end;
      const bStart = current.data.start;
      const bEnd = current.data.end;

      if (bStart <= aEnd && bEnd >= aStart) {
        last.data.start = Math.min(aStart, bStart);
        last.data.end = Math.max(aEnd, bEnd);
        continue;
      }

      if (bEnd === aStart) {
        last.data.start = bStart;
        continue;
      }
    }

    result.push(structuredClone(current));
  }

  return mergeAdjacentStyles(result);
};

const mergeFieldOps = (
  ops: BlockOperation[],
  blockType: BlockType
): BlockOperation[] => {
  const richText = compressTextEditOps(ops.filter(isRichTextOp));
  const plainText = compressTextEditOps(ops.filter(isPlainTextEditOp));

  switch (blockType) {
    case "text":
      return richText;

    case "quote":
      return plainText;

    case "code": {
      const lastAnalyse = findLast(
        ops,
        (op): op is AnalyseLangOp =>
          op.op === "analyse_lang" && op.block_type === "code"
      );

      const lastTextIndex = findLastIndex(ops, isPlainTextEditOp);

      const lastAnalyseIndex = findLastIndex(
        ops,
        (op) => op.op === "analyse_lang" && op.block_type === "code"
      );

      const result: BlockOperation[] = [...plainText];

      if (lastAnalyse && lastAnalyseIndex > lastTextIndex) {
        result.push(lastAnalyse);
      }

      return result;
    }

    case "file": {
      const lastSrc = findLast(
        ops,
        (op): op is ChangeSrcOp =>
          op.op === "change_src" && op.block_type === "file"
      );

      return lastSrc ? [lastSrc] : [];
    }

    case "img": {
      const lastSrc = findLast(
        ops,
        (op): op is ChangeSrcOp =>
          op.op === "change_src" && op.block_type === "img"
      );

      const lastAlt = findLast(
        ops,
        (op): op is ChangeAltOp =>
          op.op === "change_alt" && op.block_type === "img"
      );

      const result: BlockOperation[] = [];

      if (lastSrc) result.push(lastSrc);
      if (lastAlt) result.push(lastAlt);

      return result;
    }

    case "link": {
      const lastText = findLast(
        ops,
        (op): op is ChangeTextOp =>
          op.op === "change_text" && op.block_type === "link"
      );

      const lastUrl = findLast(
        ops,
        (op): op is ChangeUrlOp =>
          op.op === "change_url" && op.block_type === "link"
      );

      const result: BlockOperation[] = [];

      if (lastText) result.push(lastText);
      if (lastUrl) result.push(lastUrl);

      return result;
    }

    case "header": {
      return richText;
    }

    case "list": {
      const lastLevel = findLast(
        ops,
        (op): op is ChangeLevelOp =>
          op.op === "change_level" && op.block_type === "list"
      );

      const lastValue = findLast(
        ops,
        (op): op is ChangeValueOp =>
          op.op === "change_value" && op.block_type === "list"
      );

      const lastType = findLast(
        ops,
        (op): op is ChangeListTypeOp =>
          op.op === "change_type" && op.block_type === "list"
      );

      const result: BlockOperation[] = [...richText];

      if (lastLevel) result.push(lastLevel);
      if (lastValue) result.push(lastValue);
      if (lastType) result.push(lastType);

      return result;
    }

    default:
      return ops;
  }
};

export const compactSyncItems = (items: SyncType[]): SyncType[] => {
  const groups = new Map<string, { order: number; items: SyncType[] }>();

  items.forEach((item, index) => {
    const key = `${item.payload.note_id}:${item.payload.block_id}`;
    const group = groups.get(key);

    if (group) {
      group.items.push(item);
    } else {
      groups.set(key, { order: index, items: [item] });
    }
  });

  const compacted: Array<{ order: number; items: SyncType[] }> = [];

  for (const group of groups.values()) {
    const sourceItems = group.items;
    const payloads = sourceItems.map((x) => x.payload);

    const createIndex = payloads.findIndex(isCreateOp);
    const deleteIndex = findLastIndex(payloads, isDeleteOp);

    if (createIndex !== -1 && deleteIndex > createIndex) {
      continue;
    }

    if (deleteIndex !== -1) {
      const deletePayload = payloads[deleteIndex];

      compacted.push({
        order: group.order,
        items: [makeCompactedSync(deletePayload, sourceItems)],
      });

      continue;
    }

    if (createIndex !== -1) {
      compacted.push({
        order: group.order,
        items: sourceItems,
      });

      continue;
    }

    const changeTypeIndex = findLastIndex(payloads, isChangeBlockTypeOp);

    const changeTypePayload =
      changeTypeIndex !== -1 ? payloads[changeTypeIndex] : undefined;

    const opsAfterTypeChange =
      changeTypeIndex !== -1 ? payloads.slice(changeTypeIndex + 1) : payloads;

    const finalBlockType = getFinalBlockTypeFromOps(payloads);

    if (!finalBlockType) {
      compacted.push({
        order: group.order,
        items: sourceItems,
      });

      continue;
    }

    const mergedFieldPayloads = mergeFieldOps(
      opsAfterTypeChange,
      finalBlockType
    );

    const mergedPayloads: BlockOperation[] = changeTypePayload
      ? [changeTypePayload, ...mergedFieldPayloads]
      : mergedFieldPayloads;

    compacted.push({
      order: group.order,
      items: mergedPayloads.map((payload) =>
        makeCompactedSync(payload, sourceItems)
      ),
    });
  }

  compacted.sort((a, b) => a.order - b.order);

  return compacted.flatMap((x) => x.items);
};