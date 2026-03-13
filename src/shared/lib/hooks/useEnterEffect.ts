import { useEffect } from "react";

export const handleEnterPress = (event: KeyboardEvent, key: Key, onEnter: () => void) => {
  if (event.key === key) {
    event.preventDefault()
    onEnter()
  }
}

export function useEnterEffect(onEnter: () => void, ...parameters: any[]) {
  useEffect(() => {
    const handleKeyPress = (event: Event) => {
      const keyEvent = event as unknown as KeyboardEvent
      if (keyEvent.key === 'Enter') {
        event.preventDefault()
        onEnter()
      }
    };

    window.addEventListener('keydown',  handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [...parameters]);
}

type Key =
  | 'Enter'
  | 'Escape'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Tab'

