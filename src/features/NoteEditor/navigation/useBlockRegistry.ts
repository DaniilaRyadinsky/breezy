import { useRef, useCallback } from "react";
import { useBlocksRegistry } from "./model/BlocksRegistryContext";

export const useBlockRegistry = (id: string) => {
  const { registerBlock, unregisterBlock } = useBlocksRegistry();

  const editableRef = useRef<HTMLElement | null>(null);

  const setEditableRef = useCallback((node: HTMLElement | null) => {
    editableRef.current = node;

    if (node) {
      registerBlock(id, node);
    } else {
      unregisterBlock(id);
    }
  }, [id, registerBlock, unregisterBlock]);

  return {
    editableRef,
    setEditableRef
  }
}