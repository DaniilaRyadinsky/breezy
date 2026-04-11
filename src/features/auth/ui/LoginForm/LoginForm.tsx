import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import styles from './LoginForm.module.css'
import { useAuth } from '../../lib/useAuth'



export const LoginForm = () => {
  const navigate = useNavigate()

  const {
    login,
    setLogin,
    password,
    setPassword,
    loginErr,
    passwordErr,
    handleSubmit
  } = useAuth('login');

  const loginRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)


  return (
    <form className={styles.login_form} onSubmit={handleSubmit}>
      <div>
        <Input
          ref={loginRef}
          type='text'
          mode={loginErr ? 'err' : ''}
          value={login}
          onChange={(e) => setLogin(e.target.value)}>
          Телефон или адрес эл. почты
        </Input>
        {loginErr && <span className={styles.err_label}>{loginErr}</span>}
        <Input
          ref={passwordRef}
          type='password'
          mode={passwordErr ? 'err' : ''}
          value={password}
          onChange={(e) => setPassword(e.target.value)}>
          Пароль
        </Input>
        {passwordErr && <span className={styles.err_label}>{passwordErr}</span>}
        <div className={styles.recovery_link_container}>
          <Link className={styles.recovery_link} to='/recovery'>Забыли пароль?</Link>
        </div>
      </div>
      <div className={styles.btn_container}>
        <Button mode={'on_primary'} type='button' onClick={() => navigate('/signup')}>Создать аккаунт</Button>
        <Button mode={'primary'} type={'submit'} >Далее</Button>
      </div>
    </form>
  )
}
