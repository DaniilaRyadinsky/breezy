import {
  Popover,
  Paper,
  Stack,
  IconButton,
  ButtonBase,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import React, { RefObject, useEffect, useMemo, useState } from "react";
import { useSelectionMenu } from "../lib/useSelectionMenu";
import { TextStyle } from "@/entities/note/model/blockTypes";
import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Italic,
  Underline,
  Type,
  ChevronDown,
  Heading1,
  List as ListIcon,
  Quote,
  Code2,
  Image as ImageIcon,
  Link2,
  FileText,
} from "lucide-react";
import { BlockChangeType } from "@/entities/note/model/blockChangeTypes";
import { PendingEditorSelection } from "@/features/NoteEditor/lib/selection";
import { SlashMenu } from "@/features/slashMenu/ui/SlashMenu";

interface ISelectionMenu {
  editorRef: RefObject<HTMLElement | null>;
  applyStyleToSelection: (style: TextStyle) => void;
  getBlockTypeById: (blockId: string) => BlockChangeType | null;
  onPendingSelection: (selection: PendingEditorSelection) => void;
}

type BlockOption = {
  type: BlockChangeType;
  label: string;
  icon: LucideIcon;
};

const BLOCK_OPTIONS: BlockOption[] = [
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

const STYLE_ACTIONS: {
  style: TextStyle;
  label: string;
  icon: LucideIcon;
}[] = [
    { style: "bold", label: "Bold", icon: Bold },
    { style: "italic", label: "Italic", icon: Italic },
    { style: "underline", label: "Underline", icon: Underline },
  ];

export const SelectionMenu = ({
  editorRef,
  applyStyleToSelection,
  getBlockTypeById,
  onPendingSelection,
}: ISelectionMenu) => {

  const {
    menuPosition,
    isOpen,
    closeMenu,
    restoreSelection,
    currentBlockId,
    currentBlockType,
    savedSelection,
    openFromCurrentSelection,
  } = useSelectionMenu(editorRef, {
    getBlockTypeById,
  });

  const [blockMenuAnchorEl, setBlockMenuAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setBlockMenuAnchorEl(null);
    }
  }, [isOpen]);

  const isBlockMenuOpen = Boolean(blockMenuAnchorEl) && isOpen;

  const currentBlock = useMemo(() => {
    return (
      BLOCK_OPTIONS.find((item) => item.type === currentBlockType) ??
      BLOCK_OPTIONS[0]
    );
  }, [currentBlockType]);

  const CurrentBlockIcon = currentBlock.icon;

  const handleCloseBlockMenu = () => {
    setBlockMenuAnchorEl(null);
  };

  const handleCloseToolbar = () => {
    handleCloseBlockMenu();
    closeMenu();
  };

  const handleToggleBlockMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const anchorEl = e.currentTarget;

    setBlockMenuAnchorEl((prev) => {
      if (prev === anchorEl) return null;
      return anchorEl;
    });
  };

  const handleApplyStyle = (style: TextStyle) => {
    restoreSelection();
    applyStyleToSelection(style);
    handleCloseToolbar();
  };

  
  return (
    <>
      <Popover
        open={isOpen}
        onClose={handleCloseToolbar}
        anchorReference="anchorPosition"
        anchorPosition={
          menuPosition
            ? { top: menuPosition.top, left: menuPosition.left }
            : undefined
        }
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        hideBackdrop
        slotProps={{
          paper: {
            onMouseDown: (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
            },
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
            },
          },
        }}
      >
        <Paper
          sx={{
            p: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            borderRadius: 2,
          }}
        >
          <ButtonBase
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleToggleBlockMenu}
            sx={{
              px: 1,
              py: 0.75,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CurrentBlockIcon size={16} />
            <span>{currentBlock.label}</span>
            <ChevronDown size={16} />
          </ButtonBase>

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

          <Stack direction="row" spacing={0.5}>
            {STYLE_ACTIONS.map(({ style, label, icon: Icon }) => (
              <Tooltip key={style} title={label}>
                <IconButton
                  size="small"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleApplyStyle(style)}
                >
                  <Icon size={16} />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Paper>
      </Popover>

      <SlashMenu
        open={isBlockMenuOpen}
        anchorEl={blockMenuAnchorEl}
        blockId={currentBlockId}
        currentBlockType={currentBlockType}
        selection={
          savedSelection ??
          (currentBlockId
            ? {
              start: {
                blockId: currentBlockId,
                offset: 0,
              },
              end: {
                blockId: currentBlockId,
                offset: 0,
              },
            }
            : null)
        }
        onPendingSelection={onPendingSelection}
        onClose={handleCloseBlockMenu}
        onAfterSelect={(type) => {
          if (type === "img" || type === "file") {
            handleCloseToolbar();
            return;
          }

          requestAnimationFrame(() => {
            openFromCurrentSelection();
          });
        }}
      />
    </>
  );
};

type BlockListItemProps = {
  primary: string;
  Icon: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
};

export const BlockListItem = ({
  primary,
  Icon,
  selected = false,
  onClick,
}: BlockListItemProps) => {
  return (
    <ListItem disablePadding>
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <Icon size={16} />
        </ListItemIcon>
        <ListItemText primary={primary} />
      </ListItemButton>
    </ListItem>
  );
};