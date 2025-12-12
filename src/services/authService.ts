import { API_BASE_URL } from '../config/index';

export interface LoginCredentials {
  email: string;
  password: string;
}


export interface Role {
  name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  role?: string;
  roles?: Role[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  data: {
    token: string;
  };
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Login failed',
          status: response.status,
        } as ApiError;
      }
      if (data.result && data.result.token) {
        return data.result.token;
      }

      throw {
        message: 'Invalid response format - token not found',
        status: 500,
      } as ApiError;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async loginAndGetUser(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    try {
      const token = await this.login(credentials);
      
      if (!token) {
        throw {
          message: 'No token received from login response',
          status: 500,
        } as ApiError;
      }
      this.setToken(token);

      const user = await this.getCurrentUser();
      
      if (!user) {
        throw {
          message: 'Failed to get user information',
          status: 500,
        } as ApiError;
      }

      return { token, user };
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      const userData = await response.json();
      return userData;
    } catch (error) {
      if ((error as ApiError).status === 401) {
        throw error;
      }
      if (error instanceof Error) {
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }


  getToken(): string | null {
    return localStorage.getItem('enghub_admin_token');
  }

  setToken(token: string): void {
    localStorage.setItem('enghub_admin_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('enghub_admin_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();