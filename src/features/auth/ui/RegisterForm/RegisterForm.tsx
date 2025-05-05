import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../../shared/ui/Input'
import { Button } from '../../../../shared/ui/Button'
import styles from './RegisterForm.module.css'
import { fetchReg } from '../../api/auth'

export const RegisterForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [inputModeLog, setInputModeLog] = useState('')
  const [inputModePass, setInputModePass] = useState('')
  const [inputModePass2, setInputModePass2] = useState('')

  const loginRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const password2Ref = useRef<HTMLInputElement>(null)

  let navigate = useNavigate()

  const validateData = () => {
    setInputModeLog('');
    setInputModePass('');
    setInputModePass2('');
    if (username === '') {
      setInputModeLog('none')
      loginRef.current?.focus()
    }
    else if (password === '') {
      setInputModePass('none')
      passwordRef.current?.focus()
    }
    else if (password2 === '') {
      setInputModePass2('none')
      password2Ref.current?.focus()
    }
    else {
      fetchReg({
        username,
        password,
        onSuccess: () => navigate('/login'),
        onError: () => {
          setInputModeLog('err');
          setInputModePass('err');
          setInputModePass2('err');
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
  }, [username, password, password2]);

  return (
    <div className={styles.login_form}>
      <div>
        <Input
          mode={(inputModeLog === 'err' || inputModeLog === 'none') ? 'err' : ''}
          type='email' value={username}
          onChange={(e) => setUsername(e.target.value)}
          ref={loginRef}>
          Телефон или адрес эл. почты
        </Input>
        {inputModeLog === 'none' && <span className={styles.err_label}>Введите логин.</span>}
        {inputModeLog === 'err' && <span className={styles.err_label}>Имя пользователя занято.</span>}
        <Input
          mode={(inputModePass === 'err' || inputModePass === 'none') ? 'err' : ''}
          type='password' value={password}
          onChange={(e) => setPassword(e.target.value)}
          ref={passwordRef}>
          Пароль
        </Input>
        {inputModePass === 'none' && <span className={styles.err_label}>Введите пароль.</span>}
        <Input
          mode={(inputModePass2 === 'err' || inputModePass2 === 'none') ? 'err' : ''}
          type='password' value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          ref={password2Ref}>
          Повторите пароль
        </Input>
        {inputModePass2 === 'none' && <span className={styles.err_label}>Повторите пароль.</span>}
        {inputModePass2 === 'err' && <span className={styles.err_label}>Пароли не совпадают.</span>}
      </div>
      <div className={styles.btn_container}>
        <Button mode={'on_primary'} onClick={() => navigate('/login')}>Назад</Button>
        <Button mode={'primary'} onClick={validateData}>Далее</Button>
      </div>
    </div>
  )
}
