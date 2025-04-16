import React, { useRef, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/InputLogin/Input'
import { LoginForm } from '../../features/auth/index';
import LoginWidget from '../../widgets/LoginWidget/LoginWidget';

const LoginPage = () => {
  return (
    <div>
        <LoginWidget/>
    </div>
    
  )
}

export default LoginPage