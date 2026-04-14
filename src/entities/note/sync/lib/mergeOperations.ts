import { BlockType, Block } from "../../model/blockTypes";
import {
  BlockOperation,
  RichTextOperation,
  CreateBlockOp,
  DeleteBlockOp,
  ChangeTextOp,
  AnalyseLangOp,
  ChangeSrcOp,
  ChangeAltOp,
  ChangeUrlOp,
  ChangeLevelOp,
  ChangeValueOp,
  ChangeListTypeOp
} from "../../model/operationsType";
import { SyncType } from "../model/syncTypes";


const findLast = <T,>(arr: T[], predicate: (item: T) => boolean): T | undefined => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return arr[i];
  }
  return undefined;
};

const findLastIndex = <T,>(arr: T[], predicate: (item: T) => boolean): number => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
};

const isRichTextOp = (op: BlockOperation): op is RichTextOperation => {
  return (
    op.op === "insert_text" ||
    op.op === "delete_range" ||
    op.op === "apply_style"
  );
};

const isCreateOp = (op: BlockOperation): op is CreateBlockOp => op.op === "create_block";
const isDeleteOp = (op: BlockOperation): op is DeleteBlockOp => op.op === "delete_block";

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


const mergeAdjacentStyles = (ops: RichTextOperation[]): RichTextOperation[] => {
  const result: RichTextOperation[] = [];

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

const compressRichTextOps = (ops: RichTextOperation[]): RichTextOperation[] => {
  const result: RichTextOperation[] = [];

  for (const current of ops) {
    const last = result[result.length - 1];

    if (!last) {
      result.push(structuredClone(current));
      continue;
    }

    // 1. Склейка insert + insert
    if (last.op === "insert_text" && current.op === "insert_text") {
      const lastStart = last.data.pos;
      const lastEnd = last.data.pos + last.data.new_text.length;
      const curPos = current.data.pos;

      // вставка в конец ранее вставленного текста
      if (curPos === lastEnd) {
        last.data.new_text += current.data.new_text;
        continue;
      }

      // вставка внутрь ранее вставленного текста
      if (curPos >= lastStart && curPos <= lastEnd) {
        const offset = curPos - lastStart;
        last.data.new_text =
          last.data.new_text.slice(0, offset) +
          current.data.new_text +
          last.data.new_text.slice(offset);
        continue;
      }
    }

    // 2. Склейка insert + delete, если удаление затрагивает только что вставленный кусок
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

    // 3. Склейка delete + delete только для простого случая:
    // два соседних backspace/delete диапазона, идущих подряд
    if (last.op === "delete_range" && current.op === "delete_range") {
      const aStart = last.data.start;
      const aEnd = last.data.end;
      const bStart = current.data.start;
      const bEnd = current.data.end;

      // соседние или пересекающиеся диапазоны
      if (bStart <= aEnd && bEnd >= aStart) {
        last.data.start = Math.min(aStart, bStart);
        last.data.end = Math.max(aEnd, bEnd);
        continue;
      }

      // backspace серия: [4,5] потом [3,4] => [3,5]
      if (bEnd === aStart) {
        last.data.start = bStart;
        continue;
      }

      // delete серия: [2,3] потом [2,3] в новом тексте.
      // Здесь безопасно не схлопываем, иначе можно ошибиться в базовых координатах.
    }

    result.push(structuredClone(current));
  }

  return mergeAdjacentStyles(result);
};


const mergeFieldOps = (ops: BlockOperation[], blockType: BlockType): BlockOperation[] => {
  const richText = compressRichTextOps(ops.filter(isRichTextOp));

  switch (blockType) {
    case "text":
      return richText;

    case "quote": {
      const lastText = findLast(ops, (op): op is ChangeTextOp => op.op === "change_text");
      return lastText ? [lastText] : [];
    }

    case "code": {
      const lastText = findLast(ops, (op): op is ChangeTextOp => op.op === "change_text");
      const lastAnalyse = findLast(ops, (op): op is AnalyseLangOp => op.op === "analyse_lang");

      // analyse_lang оставляем только если после него не было нового change_text
      const lastTextIndex = findLastIndex(ops, (op) => op.op === "change_text");
      const lastAnalyseIndex = findLastIndex(ops, (op) => op.op === "analyse_lang");

      const result: BlockOperation[] = [];
      if (lastText) result.push(lastText);
      if (lastAnalyse && lastAnalyseIndex > lastTextIndex) result.push(lastAnalyse);

      return result;
    }

    case "file": {
      const lastSrc = findLast(ops, (op): op is ChangeSrcOp => op.op === "change_src");
      return lastSrc ? [lastSrc] : [];
    }

    case "img": {
      const lastSrc = findLast(ops, (op): op is ChangeSrcOp => op.op === "change_src");
      const lastAlt = findLast(ops, (op): op is ChangeAltOp => op.op === "change_alt");

      const result: BlockOperation[] = [];
      if (lastSrc) result.push(lastSrc);
      if (lastAlt) result.push(lastAlt);
      return result;
    }

    case "link": {
      const lastText = findLast(ops, (op): op is ChangeTextOp => op.op === "change_text");
      const lastUrl = findLast(ops, (op): op is ChangeUrlOp => op.op === "change_url");

      const result: BlockOperation[] = [];
      if (lastText) result.push(lastText);
      if (lastUrl) result.push(lastUrl);
      return result;
    }

    case "header": {
      const lastLevel = findLast(ops, (op): op is ChangeLevelOp => op.op === "change_level");
      const result: BlockOperation[] = [...richText];
      if (lastLevel) result.push(lastLevel);
      return result;
    }

    case "list": {
      const lastLevel = findLast(ops, (op): op is ChangeLevelOp => op.op === "change_level");
      const lastValue = findLast(ops, (op): op is ChangeValueOp => op.op === "change_value");
      const lastType = findLast(ops, (op): op is ChangeListTypeOp => op.op === "change_type");

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

type GetBlockSnapshot = (noteId: string, blockId: string) => Block | undefined;

export const compactSyncItems = (
  items: SyncType[],
  getBlockSnapshot: GetBlockSnapshot
): SyncType[] => {
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

    const first = payloads[0];
    const noteId = first.note_id;
    const blockId = first.block_id;

    const createIndex = payloads.findIndex(isCreateOp);
    const deleteIndex = findLastIndex(payloads, isDeleteOp);

    // create -> delete => всё исчезает
    if (createIndex !== -1 && deleteIndex > createIndex) {
      continue;
    }

    // есть delete => оставляем только delete
    if (deleteIndex !== -1) {
      const deletePayload = payloads[deleteIndex] as DeleteBlockOp;

      compacted.push({
        order: group.order,
        items: [makeCompactedSync(deletePayload, sourceItems)],
      });

      continue;
    }

    // есть create => оставляем только create с актуальным snapshot
    if (createIndex !== -1) {
      const createPayload = payloads[createIndex] as CreateBlockOp;
      const snapshot = getBlockSnapshot(noteId, blockId);

      compacted.push({
        order: group.order,
        items: [
          makeCompactedSync(
            {
              ...createPayload,
              data: {
                ...createPayload.data,
                block: snapshot ?? createPayload.data.block,
              },
            },
            sourceItems
          ),
        ],
      });

      continue;
    }

    // иначе обычные операции по существующему блоку
    const snapshot = getBlockSnapshot(noteId, blockId);
    if (!snapshot) continue;

    const mergedPayloads = mergeFieldOps(payloads, snapshot.type);

    compacted.push({
      order: group.order,
      items: mergedPayloads.map((payload) => makeCompactedSync(payload, sourceItems)),
    });
  }

  compacted.sort((a, b) => a.order - b.order);

  return compacted.flatMap((x) => x.items);
};