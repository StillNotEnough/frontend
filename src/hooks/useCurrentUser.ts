// src/hooks/useCurrentUser.ts
// Custom hook для работы с данными текущего пользователя

import { useState, useEffect } from 'react';
import authService, { type CurrentUserResponse } from '../services/authService';

interface UseCurrentUserResult {
  user: CurrentUserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (updates: { email?: string; profilePictureUrl?: string }) => Promise<void>;
}

/**
 * Hook для получения и обновления данных текущего пользователя
 * Автоматически загружает данные при монтировании компонента
 * 
 * @example
 * const { user, loading, error, refetch, updateUser } = useCurrentUser();
 * 
 * // Обновить email
 * await updateUser({ email: 'new@email.com' });
 */
export const useCurrentUser = (): UseCurrentUserResult => {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: { email?: string; profilePictureUrl?: string }) => {
    try {
      const updatedUser = await authService.updateCurrentUser(updates);
      setUser(updatedUser);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    // Загружаем данные при монтировании
    if (authService.isAuthenticated()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateUser,
  };
};

export default useCurrentUser;