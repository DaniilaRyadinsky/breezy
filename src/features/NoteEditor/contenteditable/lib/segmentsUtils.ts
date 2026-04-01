import { StyleText, TextSegmentType } from "@/entities/note/model/blockTypes";

export function normalizeSegments(segments: TextSegmentType[]): TextSegmentType[] {
  const result: TextSegmentType[] = [];

  for (const seg of segments) {
    if (!seg.text) continue;

    const last = result[result.length - 1];
    if (last && last.style === seg.style) {
      last.text += seg.text;
    } else {
      result.push({ ...seg });
    }
  }

  return result.length ? result : [{ style: StyleText.Normal, text: "" }];
}

export function getStyleAt(
  segments: TextSegmentType[],
  offset: number
): StyleText {
  let acc = 0;

  for (const seg of segments) {
    const next = acc + seg.text.length;
    if (offset <= next) return seg.style;
    acc = next;
  }

  return segments[segments.length - 1]?.style ?? StyleText.Normal;
}

export function insertTextAt(
  segments: TextSegmentType[],
  offset: number,
  text: string,
  style: StyleText
): TextSegmentType[] {
  const result: TextSegmentType[] = [];
  let acc = 0;
  let inserted = false;

  for (const seg of segments) {
    const next = acc + seg.text.length;

    if (!inserted && offset <= next) {
      const localOffset = offset - acc;
      const left = seg.text.slice(0, localOffset);
      const right = seg.text.slice(localOffset);

      if (left) result.push({ ...seg, text: left });
      if (text) result.push({ style, text });
      if (right) result.push({ ...seg, text: right });

      inserted = true;
    } else {
      result.push({ ...seg });
    }

    acc = next;
  }

  if (!inserted && text) {
    result.push({ style, text });
  }

  return normalizeSegments(result);
}

export function deleteRange(
  segments: TextSegmentType[],
  start: number,
  end: number
): TextSegmentType[] {
  if (start >= end) return segments;

  const result: TextSegmentType[] = [];
  let acc = 0;

  for (const seg of segments) {
    const segStart = acc;
    const segEnd = acc + seg.text.length;

    if (segEnd <= start || segStart >= end) {
      result.push({ ...seg });
    } else {
      const leftCount = Math.max(0, start - segStart);
      const rightStart = Math.max(0, end - segStart);

      const left = seg.text.slice(0, leftCount);
      const right = seg.text.slice(rightStart);

      if (left) result.push({ ...seg, text: left });
      if (right) result.push({ ...seg, text: right });
    }

    acc = segEnd;
  }

  return normalizeSegments(result);
}

export function replaceRange(
  segments: TextSegmentType[],
  start: number,
  end: number,
  text: string,
  style: StyleText
): TextSegmentType[] {
  const withoutRange = deleteRange(segments, start, end);
  return insertTextAt(withoutRange, start, text, style);
}

export function applyStyleToRange(
  segments: TextSegmentType[],
  start: number,
  end: number,
  style: StyleText
): TextSegmentType[] {
  if (start >= end) return segments;

  const result: TextSegmentType[] = [];
  let acc = 0;

  for (const seg of segments) {
    const segStart = acc;
    const segEnd = acc + seg.text.length;

    if (segEnd <= start || segStart >= end) {
      result.push({ ...seg });
    } else {
      const leftCut = Math.max(0, start - segStart);
      const rightCut = Math.min(seg.text.length, end - segStart);

      const left = seg.text.slice(0, leftCut);
      const middle = seg.text.slice(leftCut, rightCut);
      const right = seg.text.slice(rightCut);

      if (left) result.push({ ...seg, text: left });
      if (middle) result.push({ style, text: middle });
      if (right) result.push({ ...seg, text: right });
    }

    acc = segEnd;
  }

  return normalizeSegments(result);
}