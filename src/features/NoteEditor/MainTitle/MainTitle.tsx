import styles from './MainTitle.module.css'

interface IMainTitle {
    title: string
}

const MainTitle = ({title}: IMainTitle) => {
  return (
    <div className={styles.title_container}>
        <h1 className={styles.title}>
            {title}
        </h1>
    </div>
  )
}

export default MainTitle