// src/components/ProtectedRoute/ProtectedRoute.tsx

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from '../../context/Context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("ProtectedRoute must be used within ContextProvider");
  }

  const { isAuthenticated } = context;

  // Если не авторизован - редирект на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если авторизован - показываем контент
  return <>{children}</>;
};

export default ProtectedRoute;