import styles from './Backdrop.module.css'

interface IBackdrop {
    mode?: "gray" | "",
    onClick: () => void
}

const Backdrop = ({ onClick, mode = "" }: IBackdrop) => {
    return (
        <div
            className={styles.backdrop}
            onClick={onClick}
            style={{ backgroundColor: mode === "gray" ? "rgba(0, 0, 0, 0.3)" : "" }}
        />
    )
}

export default Backdrop