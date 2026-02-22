import React from 'react'
import clsx from 'clsx';
import styles from './Button.module.css'

interface IButton {
    children: React.ReactNode,
    mode?: string,
    onClick?: () => void,
    type?: "submit" | "reset" | "button" | undefined,
}

export const Button = (props: IButton) => {
    const {
        mode = 'primary',
        children,
        onClick,
        type
    } = props;

    return (
        <button className={clsx([styles.btn], {
            [styles.primary]: (mode === 'primary'),
            [styles.on_primary]: (mode === 'on_primary'),
            [styles.on_primary_container]: (mode === 'on_primary_container'),
            [styles.on_secondary_container]: (mode === 'on_secondary_container'),
            [styles.fab]: (mode === 'fab'),
        })} onClick={onClick}
            type={type}
        >
            {children}
        </button>
    )
}