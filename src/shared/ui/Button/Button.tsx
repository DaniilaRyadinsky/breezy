import React, { FC } from 'react'
import clsx from 'clsx';
import styles from './Button.module.css'

type IButton = {
    children: string,
    mode?: string,
    onClick: () => void,

}

export const Button = (props:IButton) => {
    const { 
        mode = 'primary', 
        children, 
        onClick 
    } = props;

    return (
        <button className={clsx([styles.btn], {
            [styles.primary]: (mode === 'primary'),
            [styles.on_primary]: (mode === 'on_primary'),
        })} onClick={onClick}>
            {children}
        </button>
    )
}