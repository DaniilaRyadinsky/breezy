import styles from './sidebar.module.css'
import { Button } from '@/shared/ui/Button'
import SidebarItem from './sidebarItem/SidebarItem'
import { useState } from 'react'
import Notes from './Panels/Notes'
import clsx from 'clsx'
import { useAppStore } from '@/shared/model/AppStore'
import {ArchiveIcon, CreateIcon, NotesIcon} from '@/shared/assets/icons'
import { BasketIcon } from '@/shared/ui/icons/BasketIcon'
import { TagsIcon } from '@/shared/ui/icons/TagsIcon'
import { useNavigate } from 'react-router-dom'

type sidebarModes = 'notes' | 'tags' | 'archive' | 'basket';

export const Sidebar = () => {
  const isSidebarOpen = useAppStore(s => s.isSidebarOpen);
  const openSidebar = useAppStore(s => s.openSidebar);

  const [mode, setMode] = useState<sidebarModes>('notes')

  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/');
  }

  const handleChangeModeClick = (mode: sidebarModes) => {
    setMode(mode);
    openSidebar()
  }

  return (
    <div className={clsx([styles.sidebar], {
      [styles.sidebar_visible]: isSidebarOpen
    })} >
      <div className={styles.left_container}>

        <Button mode='fab' onClick={() => handleCreateClick()}>
          <CreateIcon color='#fff'/>
        </Button>

        <div className={styles.sidebar_list}>
          <SidebarItem label='Заметки' isActive={mode === 'notes'} onClick={() => handleChangeModeClick('notes')}>
            <NotesIcon color={mode==='notes' ? '#fff':'#000'}  />
          </SidebarItem>

          <SidebarItem label='Теги' isActive={mode === 'tags'} onClick={() => handleChangeModeClick('tags')}>
            <TagsIcon isActive={mode === 'tags'} />
          </SidebarItem>

          <SidebarItem label='Архив' isActive={mode === 'archive'} onClick={() => handleChangeModeClick('archive')}>
            <ArchiveIcon color={mode==='archive' ? "var(--md-sys-color-on-surface-variant)" : "var(--md-sys-color-outline)"} />
          </SidebarItem>

          <SidebarItem label='Корзина' isActive={mode === 'basket'} onClick={() => handleChangeModeClick('basket')}>
            <BasketIcon isActive={mode === 'basket'} />
          </SidebarItem>

        </div>
      </div>

      <div className={clsx([styles.sidebar_panel],
        { [styles.sidebar_panel_visible]: isSidebarOpen })}>
        {isSidebarOpen && mode === 'notes' && <Notes />}
        {/* {isVisible && mode === SideBarModes.Tags && <Tags/>} */}
        {isSidebarOpen && mode === 'archive' && <Notes />}
        {isSidebarOpen && mode === 'basket' && <Notes />}
      </div>
    </div>
  )
}