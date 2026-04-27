import { TextSegmentType } from "@/entities/note/model/blockTypes";
import { segmentsToPlainText } from "./documentRichText";

// Plain text utilities
export const getBlockPlainText = (block: { data?: unknown }) => {
  const data = block.data as
    | {
        text?: string;
        text_data?: TextSegmentType[];
      }
    | undefined;

  if (!data) return "";

  if (Array.isArray(data.text_data)) {
    return segmentsToPlainText(data.text_data);
  }

  if (typeof data.text === "string") {
    return data.text;
  }

  return "";
};