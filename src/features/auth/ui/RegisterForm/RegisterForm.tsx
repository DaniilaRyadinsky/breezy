import  {  useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../../shared/ui/Input'
import { Button } from '../../../../shared/ui/Button'
import styles from './RegisterForm.module.css'
import { useAuth } from '../../lib/useAuth'


export const RegisterForm = () => {

  const navigate = useNavigate()

  const {
    login,
    setLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loginErr,
    emailErr,
    passwordErr,
    confirmPasswordErr,
    handleSubmit
  } = useAuth('registration');

  const loginRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const password2Ref = useRef<HTMLInputElement>(null)

  return (
    <form className={styles.login_form} onSubmit={handleSubmit}>
      <div>
        <Input
          mode={emailErr ? 'err' : ''}
          type='email' value={email}
          onChange={(e) => setEmail(e.target.value)}
          ref={loginRef}>
          адрес эл. почты
        </Input>
        {emailErr  && <span className={styles.err_label}>{emailErr}</span>}
        <Input
          mode={loginErr ? 'err' : ''}
          type='text' value={login}
          onChange={(e) => setLogin(e.target.value)}
          ref={loginRef}>
          имя пользователя
        </Input>
        {loginErr  && <span className={styles.err_label}>{loginErr}</span>}
        <Input
          mode={passwordErr ? 'err' : ''}
          type='password' value={password}
          onChange={(e) => setPassword(e.target.value)}
          ref={passwordRef}>
          Пароль
        </Input>
        {passwordErr && <span className={styles.err_label}>{passwordErr}</span>}
        <Input
          mode={confirmPasswordErr ? 'err' : ''}
          type='password' value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          ref={password2Ref}>
          Повторите пароль
        </Input>
        {confirmPasswordErr && <span className={styles.err_label}>{confirmPasswordErr}</span>}
      </div>
      <div className={styles.btn_container}>
        <Button mode={'on_primary'} type='button' onClick={() => navigate('/signin')}>Назад</Button>
        <Button mode={'primary'} type='submit'>Далее</Button>
      </div>
    </form>
  )
}
