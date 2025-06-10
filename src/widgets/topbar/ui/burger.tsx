import styles from './topbar.module.css'
import menu from '../../../shared/assets/icons/menu.svg'

interface IBurger {
onClick: ()=> void
}

const Burger = ({onClick}: IBurger) => {
  return (
    <>
         <img className={styles.burger} src={menu} onClick={onClick}/>
    </>
  )
}

export default Burger