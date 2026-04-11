import { LoginForm } from '@/features/auth/index';
import { AuthContainer } from '@/features/auth/ui/AuthContainer/index';

export  const LoginPage = () => {
  return (
    <div>
      <AuthContainer title='Вход' description='Для перехода к Breezy Notes войдите в свой аккаунт Breezy'><LoginForm /></AuthContainer>
    </div>
  )
}
