import React, { JSX, ReactElement } from 'react'
import logo from '../../assets/img/logo.webp'
import styles from './AuthContainer.module.css'

interface IAuhtContainer {
    title: string,
    description: string
    children: React.ReactNode
}

export const AuthContainer = ({title, description, children}:IAuhtContainer) => {
    return (
        <div className={styles.container}>
            <div className={styles.login_container}>
                <div className={styles.login_description}>
                    <img className={styles.logo} src={logo} alt='лого' />
                    <h1 className={styles.login_title}>{title}</h1>
                    <p className={styles.login_title_description}> {description}</p>
                </div>
                {children}
            </div>
        </div>
    )
}