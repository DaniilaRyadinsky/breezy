import { useEffect } from "react";

export function useEnterEffect(onEnter: () => void, ...parameters: any[]) {
  useEffect(() => {
    const handleKeyPress = (event: Event) => {
      const keyEvent = event as unknown as KeyboardEvent
      if (keyEvent.key === 'Enter') {
        event.preventDefault()
        onEnter()
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [...parameters]);
}