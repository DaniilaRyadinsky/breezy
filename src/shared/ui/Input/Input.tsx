import React, { FC, Ref, useState } from 'react'
import styles from './Input.module.css'
import clsx from 'clsx'

interface IInput {
    mode: string,
    type: string,
    children: string,
    value: string,
    ref: Ref<HTMLInputElement>,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

export const Input = ({mode, ref, type, value, onChange, children}: IInput) => {
    const [isFocus, setIsFocus] = useState(false)


    function Focus(e: React.FocusEvent<HTMLInputElement>) {
        e.preventDefault();
        setIsFocus(true);
    }

    function Blur(e: React.FocusEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.value === '')
            setIsFocus(false)
    }

    return (
        <div className={styles.input_container}>
            <div className={clsx([styles.input_login_label], {
                [styles.focus_label] : (isFocus === true),
                [styles.err_label] : (mode==='err')
            })} >{children}</div>
            <div className={clsx([styles.input_border], {
                [styles.focus_border] : (isFocus === true),
                [styles.err_border] : (mode==='err')
            })}>
                <input className={styles.input}
                    ref={ref}
                    type={type}
                    value={value}
                    onFocus={Focus}
                    onBlur={Blur}
                    onChange={onChange}/>
            </div>
        </div>
    )
}