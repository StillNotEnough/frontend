// src/services/apiClient.ts - СОЗДАЙ ЭТОТ ФАЙЛ

import authService from './authService';

/**
 * Обертка над fetch с автоматическим добавлением токена
 * и обработкой 401 ошибок
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  
  // Получаем валидный access token (обновит если нужно)
  const token = await authService.getValidAccessToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  // Добавляем токен в headers
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Выполняем запрос
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Если 401 - пробуем обновить токен и повторить запрос
  if (response.status === 401) {
    console.log('🔄 Got 401, attempting to refresh token...');
    
    try {
      // Пробуем обновить токены
      await authService.refreshTokens();
      const newToken = authService.getAccessToken();

      if (!newToken) {
        throw new Error('Failed to refresh token');
      }

      // Повторяем запрос с новым токеном
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json',
      };

      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });

      return retryResponse;

    } catch (error) {
      console.error('❌ Failed to refresh token, logging out');
      authService.logout();
      window.location.href = '/login';
      throw error;
    }
  }

  return response;
}

/**
 * Упрощенные методы для GET, POST, PUT, DELETE
 */
export const apiClient = {
  get: async (url: string) => {
    return fetchWithAuth(url, { method: 'GET' });
  },

  post: async (url: string, data: unknown) => {
    return fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: async (url: string, data: unknown) => {
    return fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (url: string) => {
    return fetchWithAuth(url, { method: 'DELETE' });
  },
};

/**
 * Пример использования:
 * 
 * import { apiClient } from './services/apiClient';
 * 
 * // GET запрос
 * const response = await apiClient.get('http://localhost:8080/chats');
 * const chats = await response.json();
 * 
 * // POST запрос
 * const response = await apiClient.post('http://localhost:8080/chats', {
 *   title: 'New chat',
 *   subject: 'math'
 * });
 */