import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../../shared/ui/Button/index'
import { Input } from '../../../../shared/ui/InputLogin/index'
import { fetchLogin } from '../../api/login'
import styles from './LoginForm.module.css'

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [inputModeLog, setInputModeLog] = useState('')
  const [inputModePass, setInputModePass] = useState('')
  const loginRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const validateData = () => {
    if (username === '') {
      setInputModeLog('none')
      loginRef.current?.focus()
    }
    else if (password === '') {
      setInputModePass('none')
      passwordRef.current?.focus()
    }
    else {
      setInputModeLog('');
      setInputModePass('');
      fetchLogin({
        username,
        password,
        onSuccess: () => navigate('/main'),
        onError: () => {
          setInputModeLog('err');
          setInputModePass('err');
        }
      })
    }
  }

  useEffect(() => {
    const handleKeyPress = (event: Event) => {
      const keyEvent = event as unknown as KeyboardEvent
      if (keyEvent.key === 'Enter') {
        event.preventDefault()
        validateData()
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [username, password]);

  return (
    <div className={styles.login_form}>
      <div>
        <Input
          ref={loginRef}
          type='email'
          mode={(inputModeLog === 'err' || inputModeLog === 'none') ? 'err' : ''}
          value={username}
          onChange={(e) => setUsername(e.target.value)}>
          Телефон или адрес эл. почты
        </Input>
        {/* {inputModeLog === 'err' && <span className={styles.err_label}>Не удалось найти аккаунт Breezy.</span>} */}
        {inputModeLog === 'none' && <span className={styles.err_label}>Введите логин.</span>}
        <Input
          ref={passwordRef}
          type='password'
          mode={(inputModePass === 'err' || inputModePass === 'none') ? 'err' : ''}
          value={password}
          onChange={(e) => setPassword(e.target.value)}>
          Пароль
        </Input>
        {inputModePass === 'none' && <span className={styles.err_label}>Введите пароль.</span>}
        {inputModePass === 'err' && <span className={styles.err_label}>Неверный логин или пароль. Повторите попытку, или нажмите "Забыли пароль?", чтобы сбросить его.</span>}
        <div className={styles.recovery_link_container}>
          <Link className={styles.recovery_link} to='/recovery'>Забыли пароль?</Link>
        </div>
      </div>
      <div className={styles.btn_container}>
        <Button mode={'on_primary'} onClick={() => navigate('/reg')}>Создать аккаунт</Button>
        <Button mode={'primary'} onClick={validateData}>Далее</Button>
      </div>
    </div>
  )
}
