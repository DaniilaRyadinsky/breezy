import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/lib/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'unknown') {
    // Пока мы проверяем сессию, показываем загрузчик
    return <div>Загрузка...</div>;
  }

  if (status === 'guest') {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute