// src/components/ProtectedRoute/ProtectedRoute.tsx - С РАЗДЕЛЕННЫМИ КОНТЕКСТАМИ

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/Context'; // ✅ ИЗМЕНИЛИ ИМПОРТ

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // ✅ Используем useAuth вместо Context
  const { isAuthenticated } = useAuth();

  // Если не авторизован - редирект на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован - показываем контент
  return <>{children}</>;
};

export default ProtectedRoute;