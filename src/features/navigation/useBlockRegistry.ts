import { useRef, useCallback } from "react";
import { useBlocksRegistry } from "./model/BlocksRegistryContext";

export const useBlockRegistry = (id: string) => {
  const { registerBlock, unregisterBlock } = useBlocksRegistry();

  const editableRef = useRef<HTMLElement | null>(null);

  const setEditableRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    editableRef.current = node;
    registerBlock(id, node);

    return () => {
      if (editableRef.current === node) {
        editableRef.current = null;
      }
      unregisterBlock(id);
    };
  }, [id, registerBlock, unregisterBlock]);

  return {
    editableRef,
    setEditableRef
  }
}