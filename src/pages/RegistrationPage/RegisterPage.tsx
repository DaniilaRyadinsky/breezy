import React from 'react'
import { AuthContainer } from '../../shared/ui/AuthContainer'
import { RegisterForm } from '../../features/auth'

const RegisterPage = () => {
  return (
    <div>
        <AuthContainer title='Создать аккаунт Breezy' description='Придумайте логин и пароль'><RegisterForm></RegisterForm></AuthContainer>
    </div>
  )
}

export default RegisterPage