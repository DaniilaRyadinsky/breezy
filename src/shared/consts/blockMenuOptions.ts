import type { LucideIcon } from "lucide-react";
import {
  Type,
  Heading1,
  List as ListIcon,
  Quote,
  Code2,
  Image as ImageIcon,
  Link2,
  FileText,
} from "lucide-react";
import type { BlockChangeType } from "@/entities/note/model/blockChangeTypes";

export type BlockOption = {
  type: BlockChangeType;
  label: string;
  icon: LucideIcon;
};

export const BLOCK_OPTIONS: BlockOption[] = [
  { type: "text", label: "Текст", icon: Type },
  { type: "header_1", label: "Заголовок 1", icon: Heading1 },
  { type: "header_2", label: "Заголовок 2", icon: Heading1 },
  { type: "header_3", label: "Заголовок 3", icon: Heading1 },
  { type: "header_4", label: "Заголовок 4", icon: Heading1 },
  { type: "unordered", label: "Маркированный список", icon: ListIcon },
  { type: "ordered", label: "Нумерованный список", icon: ListIcon },
  { type: "todo", label: "Todo список", icon: ListIcon },
  { type: "quote", label: "Цитата", icon: Quote },
  { type: "code", label: "Код", icon: Code2 },
  { type: "img", label: "Изображение", icon: ImageIcon },
  { type: "link", label: "Ссылка", icon: Link2 },
  { type: "file", label: "Файл", icon: FileText },
];