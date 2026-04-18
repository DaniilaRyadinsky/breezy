import {
  Popover,
  Paper,
  Stack,
  IconButton,
  ButtonBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import React, { RefObject, useMemo, useState } from "react";
import { useSelectionMenu } from "../lib/useSelectionMenu";
import { BlockType, TextStyle } from "@/entities/note/model/blockTypes";
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
import { getAvailableBlockTypes } from "@/entities/note/lib/blockConversion";

interface ISelectionMenu {
  editorRef: RefObject<HTMLElement | null>;
  applyStyleToSelection: (style: TextStyle) => void;
  getBlockTypeById: (blockId: string) => BlockType | null;
  onChangeBlockType: (type: BlockType) => void;
}

type BlockOption = {
  type: BlockType;
  label: string;
  icon: LucideIcon;
};

const BLOCK_OPTIONS: BlockOption[] = [
  { type: "text", label: "Текст", icon: Type },
  { type: "header", label: "Заголовок", icon: Heading1 },
  { type: "list", label: "Список", icon: ListIcon },
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
  onChangeBlockType,
}: ISelectionMenu) => {
  const {
    menuPosition,
    isOpen,
    closeMenu,
    restoreSelection,
    currentBlockType,
  } = useSelectionMenu(editorRef, {
    getBlockTypeById,
  });

  const [blockMenuAnchorEl, setBlockMenuAnchorEl] = useState<HTMLElement | null>(null);

  const isBlockMenuOpen = Boolean(blockMenuAnchorEl) && isOpen;

  const currentBlock = useMemo(() => {
    return (
      BLOCK_OPTIONS.find((item) => item.type === currentBlockType) ??
      BLOCK_OPTIONS[0]
    );
  }, [currentBlockType]);

  const availableBlockOptions = useMemo(() => {
    if (!currentBlockType) return [];

    const allowed = new Set(getAvailableBlockTypes(currentBlockType));
    return BLOCK_OPTIONS.filter((item) => allowed.has(item.type));
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

    setBlockMenuAnchorEl((prev) => {
      if (prev) return null;
      return e.currentTarget;
    });
  };

  const handleApplyStyle = (style: TextStyle) => {
    restoreSelection();
    applyStyleToSelection(style);
    handleCloseToolbar();
  };

  const handleChangeBlock = (type: BlockType) => {
    restoreSelection();
    onChangeBlockType(type);
    handleCloseBlockMenu();
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
            onMouseDown={(e) => e.preventDefault()}
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
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleApplyStyle(style)}
                >
                  <Icon size={16} />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Paper>
      </Popover>

      <Popover
        open={isBlockMenuOpen}
        anchorEl={blockMenuAnchorEl}
        onClose={handleCloseBlockMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        hideBackdrop
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
            },
            onMouseDown: (e: React.MouseEvent) => {
              e.preventDefault();
            },
          },
        }}
      >
        <List
          dense
          sx={{
            minWidth: 220,
            py: 0.5,
          }}
        >
          {availableBlockOptions.map((item) => (
            <BlockListItem
              key={item.type}
              primary={item.label}
              Icon={item.icon}
              selected={item.type === currentBlockType}
              onClick={() => handleChangeBlock(item.type)}
            />
          ))}
        </List>
      </Popover>
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