import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type {Option} from '../../model/types'

interface IContextMenu {
  children: React.ReactNode,
  options: Option[],
}

export const ContextMenu = ({ children, options }: IContextMenu) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
        // Other native context menus might behave different.
        // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
        null,
    );

    // Prevent text selection lost after opening the context menu on Safari and Firefox
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      setTimeout(() => {
        selection.addRange(range);
      });
    }
  };

  const handleClick = (action: () => void) => {
    setContextMenu(null);
    action();
  };

  const handleItemClick =
    (action: () => void) => (event: React.MouseEvent<HTMLElement>) => {
      // уводим фокус с MenuItem ДО того, как MUI повесит aria-hidden
      (event.currentTarget as HTMLElement).blur();

      setContextMenu(null);

      // действие запускаем после закрытия
      setTimeout(action, 0);
      console.log('click');
    };

  return (
    <div onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
      {children}
      < Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {options.map((item, index) => (
          <MenuItem key={index} onClick={handleItemClick(item.action)}>
            {item.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}