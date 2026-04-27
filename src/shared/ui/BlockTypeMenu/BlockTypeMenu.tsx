import {
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
} from "@mui/material";
import type { LucideIcon } from "lucide-react";
import type { BlockChangeType } from "@/entities/note/model/blockChangeTypes";
import { BlockOption } from "@/shared/consts/blockMenuOptions";


type BlockTypeMenuProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  options: BlockOption[];
  selectedType?: BlockChangeType | null;
  onClose: () => void;
  onSelect: (type: BlockChangeType) => void;
};

export const BlockTypeMenu = ({
  open,
  anchorEl,
  options,
  selectedType,
  onClose,
  onSelect,
}: BlockTypeMenuProps) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 6],
          },
        },
      ]}
      sx={{ zIndex: 1400 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          sx={{
            minWidth: 220,
            py: 0.5,
            borderRadius: 2,
          }}
        >
          <List dense>
            {options.map((item) => (
              <BlockListItem
                key={item.type}
                primary={item.label}
                Icon={item.icon}
                selected={item.type === selectedType}
                onClick={() => onSelect(item.type)}
              />
            ))}
          </List>
        </Paper>
      </ClickAwayListener>
    </Popper>
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