import React from 'react'
import styles from './SidebarItem.module.css'
import clsx from 'clsx'

interface ISidebarItem {
    children: React.ReactNode,
    label: string,
    isActive: boolean,
    onClick: () => void,
}


export const SidebarItem = ({children, label, isActive, onClick}: ISidebarItem) => {
  return (
    <div onClick={onClick} className={styles.sidebar_item}>
        <div className={clsx([styles.sidebar_item_icon], {
                [styles.sidebar_item_icon_active] : (isActive === true),
            })}>
            {children}
        </div>
        <label className={styles.sidebar_item_text}>{label}</label>
    </div>
  )
}

export default SidebarItem