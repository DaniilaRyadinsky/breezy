import styles from './sidebar.module.css'
import { Button } from '../../../shared/ui/Button'
import SidebarItem from '../../../shared/ui/sidebarItem/SidebarItem'
import { useState } from 'react'
import Notes from './Panels/Notes'
import clsx from 'clsx'

interface ISideBar {
  isVisible: boolean;
  selectedId: string,
  setIsVisible: (isVisible: boolean)=> void,
  onSelectNote: (name: string) => void
}

enum SideBarModes {
  Notes,
  Tags,
  Archive,
  Basket
}

export const Sidebar = ({onSelectNote, selectedId, isVisible, setIsVisible}: ISideBar) => {
  const [mode, setMode] = useState(SideBarModes.Notes)

  return (
    <div className={clsx([styles.sidebar], {
      [styles.sidebar_visible]:isVisible
    })} >
      <div className={styles.left_container}>
        <Button mode='fab' onClick={() => console.log("click")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path fill="var(--md-sys-color-tertiary)" d="M3 17.46V20.5C3 20.78 3.22 21 3.5 21H6.54C6.67 21 6.8 20.95 6.89 20.85L17.81 9.94L14.06 6.19L3.15 17.1C3.05 17.2 3 17.32 3 17.46ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" />
            </g>
          </svg>
        </Button>
        <div className={styles.sidebar_list}>
          <SidebarItem label='Заметки' isActive={mode === SideBarModes.Notes ? true : false} onClick={() => {setMode(SideBarModes.Notes); setIsVisible(true)}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill={mode === SideBarModes.Notes ? "var(--md-sys-color-on-surface-variant)" : "var(--md-sys-color-outline)"} d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 17H8C7.45 17 7 16.55 7 16C7 15.45 7.45 15 8 15H13C13.55 15 14 15.45 14 16C14 16.55 13.55 17 13 17ZM16 13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13ZM16 9H8C7.45 9 7 8.55 7 8C7 7.45 7.45 7 8 7H16C16.55 7 17 7.45 17 8C17 8.55 16.55 9 16 9Z" />
            </svg>
          </SidebarItem>
          <SidebarItem label='Теги' isActive={mode === SideBarModes.Tags ? true : false} onClick={() => {setMode(SideBarModes.Tags); setIsVisible(true)}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path fill={mode === SideBarModes.Tags ? "var(--md-sys-color-on-surface-variant)" : "var(--md-sys-color-outline)"} d="M19 18L21 19V3C21 1.9 20.1 1 19 1H8.99C7.89 1 7 1.9 7 3H17C18.1 3 19 3.9 19 5V18ZM15 5H5C3.9 5 3 5.9 3 7V23L10 20L17 23V7C17 5.9 16.1 5 15 5Z" />
              </g>
            </svg>

          </SidebarItem>
          <SidebarItem label='Архив' isActive={mode === SideBarModes.Archive ? true : false} onClick={() => {setMode(SideBarModes.Archive); setIsVisible(true)}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path fill={mode === SideBarModes.Archive ? "var(--md-sys-color-on-surface-variant)" : "var(--md-sys-color-outline)"} d="M20.54 5.23L19.15 3.55C18.88 3.21 18.47 3 18 3H6C5.53 3 5.12 3.21 4.84 3.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V6.5C21 6.02 20.83 5.57 20.54 5.23ZM11.65 17.15L6.5 12H10V10H14V12H17.5L12.35 17.15C12.16 17.34 11.84 17.34 11.65 17.15ZM5.12 5L5.93 4H17.93L18.87 5H5.12Z" />
              </g>
              <defs>
                <clipPath id="clip0_239_117">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>

          </SidebarItem>
          <SidebarItem label='Корзина' isActive={mode === SideBarModes.Basket ? true : false} onClick={() => {setMode(SideBarModes.Basket); setIsVisible(true)}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path fill={mode === SideBarModes.Basket ? "var(--md-sys-color-on-surface-variant)" : "var(--md-sys-color-outline)"} d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM9 9H15C15.55 9 16 9.45 16 10V18C16 18.55 15.55 19 15 19H9C8.45 19 8 18.55 8 18V10C8 9.45 8.45 9 9 9ZM15.5 4L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4H15.5Z" />
              </g>
              <defs>
                <clipPath id="clip0_239_96">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>

          </SidebarItem>
        </div>
      </div>

      <div className={clsx({[styles.sidebar_panel]:isVisible})}>
        {isVisible && mode === SideBarModes.Notes && <Notes onSelectNote={onSelectNote} selectedId={selectedId}/>}
        {/* {isVisible && mode === SideBarModes.Tags && <Tags onSelectNote={onSelectNote} selectedId={selectedId}/>} */}
        {isVisible && mode === SideBarModes.Archive && <Notes onSelectNote={onSelectNote} selectedId={selectedId}/>}
        {isVisible && mode === SideBarModes.Basket && <Notes onSelectNote={onSelectNote} selectedId={selectedId}/>}
      </div>
    </div>
  )
}