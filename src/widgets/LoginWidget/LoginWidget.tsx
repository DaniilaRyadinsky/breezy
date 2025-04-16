import styles from './LoginWidgets.module.css'
import logo from '../../shared/assets/img/logo.webp'
import { LoginForm } from '../../features/auth/ui/LoginForm';

const LoginWidget = () => {
    return (
        <div className={styles.container}>
          <div className={styles.login_container}>
            <div className={styles.login_description}>
              <img className={styles.logo} src={logo} alt='лого' />
              <h1 className={styles.login_title}>Вход</h1>
              <p className={styles.login_title_description}> Для перехода к Breezy Notes войдите в свой аккаунт Breezy</p>
            </div>
            <LoginForm/>
          </div>
        </div>
      )
}

export default LoginWidget