import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../entities/user/lib/authStore";
import { useEffect } from "react";

export const useProtectedRoute = () => {
  // Подписываемся на статус
  const status = useAuthStore((state) => state.status);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'guest') {
      const from = location.state?.from?.pathname || '/main';
      navigate('/signin', { state: { from: from }, replace: true });
    }
  }, [status, navigate, location]);
}