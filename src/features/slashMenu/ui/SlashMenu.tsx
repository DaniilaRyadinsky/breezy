import { useMemo } from "react";

import { changeBlockType } from "@/entities/note/model/storeOperations";
import type { BlockChangeType } from "@/entities/note/model/blockChangeTypes";
import {
  toBlockChangeTarget,
} from "@/entities/note/model/blockChangeTypes";
import { getAvailableBlockTypes } from "@/entities/note/lib/blockConversion";
import { BLOCK_OPTIONS } from "@/shared/consts/blockMenuOptions";
import { BlockTypeMenu } from "@/shared/ui/BlockTypeMenu/BlockTypeMenu";

type SlashMenuProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  blockId: string | null;
  currentBlockType: BlockChangeType | null;
  onClose: () => void;
};

export const SlashMenu = ({
  open,
  anchorEl,
  blockId,
  currentBlockType,
  onClose,
}: SlashMenuProps) => {
  const availableBlockOptions = useMemo(() => {
    if (!currentBlockType) return BLOCK_OPTIONS;

    const baseType = toBlockChangeTarget(currentBlockType).type;
    const allowed = new Set(getAvailableBlockTypes(baseType));

    return BLOCK_OPTIONS.filter((item) => allowed.has(item.type));
  }, [currentBlockType]);

  const handleSelect = (type: BlockChangeType) => {
    if (blockId) {
      changeBlockType(blockId, type);
    }

    onClose();
  };

  return (
    <BlockTypeMenu
      open={open}
      anchorEl={anchorEl}
      options={availableBlockOptions}
      selectedType={currentBlockType}
      onClose={onClose}
      onSelect={handleSelect}
    />
  );
};