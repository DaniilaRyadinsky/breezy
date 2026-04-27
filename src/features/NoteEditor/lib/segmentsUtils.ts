import { TextStyle, TextSegmentType } from "@/entities/note/model/blockTypes";
import { getSegmentsLength } from "./documentRichText";

const EMPTY_SEGMENT: TextSegmentType = {
  style: "default",
  string: "",
};

export function ensureSegments(
  segments?: TextSegmentType[] | null
): TextSegmentType[] {
  return Array.isArray(segments) && segments.length > 0
    ? segments.map((seg) => ({ ...seg }))
    : [{ ...EMPTY_SEGMENT }];
}

export function normalizeSegments(
  segments: TextSegmentType[]
): TextSegmentType[] {
  const result: TextSegmentType[] = [];

  for (const seg of ensureSegments(segments)) {
    if (!seg.string) continue;

    const last = result[result.length - 1];
    if (last && last.style === seg.style) {
      last.string += seg.string;
    } else {
      result.push({ ...seg });
    }
  }

  return result.length ? result : [{ ...EMPTY_SEGMENT }];
}

export function getStyleAt(
  segments: TextSegmentType[],
  offset: number
): TextStyle {
  const safeSegments = ensureSegments(segments);
  let acc = 0;

  for (const seg of safeSegments) {
    const next = acc + seg.string.length;
    if (offset <= next) return seg.style;
    acc = next;
  }

  return safeSegments[safeSegments.length - 1].style;
}

export function insertTextAt(
  segments: TextSegmentType[],
  offset: number,
  string: string,
  style: TextStyle
): TextSegmentType[] {
  const safeSegments = ensureSegments(segments);
  const result: TextSegmentType[] = [];
  let acc = 0;
  let inserted = false;

  for (const seg of safeSegments) {
    const next = acc + seg.string.length;

    if (!inserted && offset <= next) {
      const localOffset = offset - acc;
      const left = seg.string.slice(0, localOffset);
      const right = seg.string.slice(localOffset);

      if (left) result.push({ ...seg, string: left });
      if (string) result.push({ style, string });
      if (right) result.push({ ...seg, string: right });

      inserted = true;
    } else {
      result.push({ ...seg });
    }

    acc = next;
  }

  if (!inserted && string) {
    result.push({ style, string });
  }

  return normalizeSegments(result);
}

export function deleteRange(
  segments: TextSegmentType[],
  start: number,
  end: number
): TextSegmentType[] {
  const safeSegments = ensureSegments(segments);

  if (start >= end) return safeSegments;

  const result: TextSegmentType[] = [];
  let acc = 0;

  for (const seg of safeSegments) {
    const segStart = acc;
    const segEnd = acc + seg.string.length;

    if (segEnd <= start || segStart >= end) {
      result.push({ ...seg });
    } else {
      const leftCount = Math.max(0, start - segStart);
      const rightStart = Math.max(0, end - segStart);

      const left = seg.string.slice(0, leftCount);
      const right = seg.string.slice(rightStart);

      if (left) result.push({ ...seg, string: left });
      if (right) result.push({ ...seg, string: right });
    }

    acc = segEnd;
  }

  return normalizeSegments(result);
}

export function applyStyleToRange(
  segments: TextSegmentType[],
  start: number,
  end: number,
  style: TextStyle
): TextSegmentType[] {
  const safeSegments = ensureSegments(segments);

  if (start >= end) return safeSegments;

  const result: TextSegmentType[] = [];
  let acc = 0;

  for (const seg of safeSegments) {
    const segStart = acc;
    const segEnd = acc + seg.string.length;

    if (segEnd <= start || segStart >= end) {
      result.push({ ...seg });
    } else {
      const leftCut = Math.max(0, start - segStart);
      const rightCut = Math.min(seg.string.length, end - segStart);

      const left = seg.string.slice(0, leftCut);
      const middle = seg.string.slice(leftCut, rightCut);
      const right = seg.string.slice(rightCut);

      if (left) result.push({ ...seg, string: left });
      if (middle) result.push({ style, string: middle });
      if (right) result.push({ ...seg, string: right });
    }

    acc = segEnd;
  }

  return normalizeSegments(result);
}

export function sliceSegments(
  segments: TextSegmentType[],
  start: number,
  end: number
): TextSegmentType[] {
  const safeSegments = ensureSegments(segments);

  if (start >= end) return [];

  const result: TextSegmentType[] = [];
  let acc = 0;

  for (const seg of safeSegments) {
    const segStart = acc;
    const segEnd = acc + seg.string.length;

    const overlapStart = Math.max(start, segStart);
    const overlapEnd = Math.min(end, segEnd);

    if (overlapStart < overlapEnd) {
      result.push({
        style: seg.style,
        string: seg.string.slice(
          overlapStart - segStart,
          overlapEnd - segStart
        ),
      });
    }

    acc = segEnd;
  }

  return normalizeSegments(result);
}

export function getBlockContentElement(blockEl: HTMLElement): HTMLElement {
  return blockEl.querySelector<HTMLElement>("[data-block-content]") ?? blockEl;
}

export const splitSegments = (
  segments: TextSegmentType[],
  offset: number
): {
  left: TextSegmentType[];
  right: TextSegmentType[];
} => {
  const length = getSegmentsLength(segments);

  return {
    left: normalizeSegments(sliceSegments(segments, 0, offset)),
    right: normalizeSegments(sliceSegments(segments, offset, length)),
  };
};