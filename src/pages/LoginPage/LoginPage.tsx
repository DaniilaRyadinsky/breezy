import { LoginForm } from '../../features/auth/index';
import { AuthContainer } from '../../shared/ui/AuthContainer/index';

const LoginPage = () => {
  return (
    <div>
      <AuthContainer title='Вход' description='Для перехода к Breezy Notes войдите в свой аккаунт Breezy'><LoginForm /></AuthContainer>
    </div>
  )
}

export default LoginPage