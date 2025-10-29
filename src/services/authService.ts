// src/services/authService.ts - ПОЛНОСТЬЮ ЗАМЕНИ

const API_BASE_URL = 'http://localhost:8080/api/v1/auth'; // Измени на свой URL

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  email: string;
}

export interface TokenPairResponse {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  username: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

class AuthService {
  private refreshPromise: Promise<TokenPairResponse> | null = null;

  // Логин
  async login(credentials: LoginRequest): Promise<TokenPairResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error: ErrorResponse = await response.json();
          throw new Error(error.message || 'Login failed');
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error('Server returned non-JSON response. Check if backend is running on http://localhost:8080');
        }
      }

      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if backend is running.');
    }
  }

  // Регистрация
  async signUp(userData: SignUpRequest): Promise<TokenPairResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error: ErrorResponse = await response.json();
          throw new Error(error.message || 'Sign up failed');
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response. Check if backend is running correctly.');
        }
      }

      return response.json();
    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if backend is running.');
    }
  }

  // Обновление токенов
  async refreshTokens(): Promise<TokenPairResponse> {
    // Предотвращаем множественные одновременные запросы на refresh
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<TokenPairResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data: TokenPairResponse = await response.json();
      
      // Сохраняем новые токены
      this.saveTokens(data);
      
      console.log('✅ Tokens refreshed successfully');
      return data;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Если refresh не удался - разлогиниваем
      this.logout();
      throw error;
    }
  }

  // Logout на бекенде
  async logoutOnBackend(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) return;

    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      console.log('✅ Logged out on backend');
    } catch (error) {
      console.error('Logout on backend failed:', error);
    }
  }

  // Сохранить оба токена
  saveTokens(data: TokenPairResponse) {
    // Access Token
    localStorage.setItem('access_token', data.accessToken);
    const accessExpiration = Date.now() + (data.accessTokenExpiresIn * 1000);
    localStorage.setItem('access_token_expiration', accessExpiration.toString());
    
    // Refresh Token
    localStorage.setItem('refresh_token', data.refreshToken);
    const refreshExpiration = Date.now() + (data.refreshTokenExpiresIn * 1000);
    localStorage.setItem('refresh_token_expiration', refreshExpiration.toString());
    
    // Username
    localStorage.setItem('username', data.username);

    console.log('✅ Tokens saved:', {
      accessExpiresIn: `${Math.floor(data.accessTokenExpiresIn / 60)} minutes`,
      refreshExpiresIn: `${Math.floor(data.refreshTokenExpiresIn / 86400)} days`
    });
  }

  // Сохранить username
  saveUsername(username: string) {
    localStorage.setItem('username', username);
  }

  // Получить access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Получить refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Получить username
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Проверка истек ли access token
  isAccessTokenExpired(): boolean {
    const expiration = localStorage.getItem('access_token_expiration');
    if (!expiration) {
      console.log('❌ No access token expiration found');
      return true;
    }
    
    const isExpired = Date.now() > parseInt(expiration);
    const secondsLeft = Math.floor((parseInt(expiration) - Date.now()) / 1000);
    
    if (isExpired) {
      console.log('❌ Access token expired');
    } else {
      console.log(`✅ Access token valid for ${secondsLeft} seconds (${Math.floor(secondsLeft/60)} min)`);
    }
    
    return isExpired;
  }

  // Проверка истек ли refresh token
  isRefreshTokenExpired(): boolean {
    const expiration = localStorage.getItem('refresh_token_expiration');
    if (!expiration) {
      console.log('❌ No refresh token expiration found');
      return true;
    }
    
    const isExpired = Date.now() > parseInt(expiration);
    const secondsLeft = Math.floor((parseInt(expiration) - Date.now()) / 1000);
    
    if (isExpired) {
      console.log('❌ Refresh token expired');
    } else {
      console.log(`✅ Refresh token valid for ${secondsLeft} seconds (${Math.floor(secondsLeft/3600)} hours)`);
    }
    
    return isExpired;
  }

  // Проверка скоро ли истечет access token (за 5 минут до истечения)
  willAccessTokenExpireSoon(): boolean {
    const expiration = localStorage.getItem('access_token_expiration');
    if (!expiration) return true;
    
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() > (parseInt(expiration) - fiveMinutes);
  }

  // Проверка аутентификации
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) return false;
    
    // Если refresh token истек - не авторизован
    if (this.isRefreshTokenExpired()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Полный logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expiration');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh_token_expiration');
    localStorage.removeItem('username');
    console.log('✅ Logged out locally');
  }

  // Получить access token, обновив если нужно
  async getValidAccessToken(): Promise<string | null> {
    // Если access token истек или скоро истечет - обновляем
    if (this.isAccessTokenExpired() || this.willAccessTokenExpireSoon()) {
      console.log('🔄 Access token expired or expiring soon, refreshing...');
      
      try {
        await this.refreshTokens();
        return this.getAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }
    
    return this.getAccessToken();
  }
}

export default new AuthService();