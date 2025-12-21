// src/components/ProtectedRoute/ProtectedRoute.tsx - С РАЗДЕЛЕННЫМИ КОНТЕКСТАМИ

import { useAuth } from "../../context/Context";
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Используем useAuth вместо Context
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal("login");
    }
  }, [isAuthenticated, openAuthModal]);

  // Если не авторизован - не показываем контент
  if (!isAuthenticated) {
    return null;
  }

  // Если авторизован - показываем контент
  return <>{children}</>;
};

export default ProtectedRoute;
