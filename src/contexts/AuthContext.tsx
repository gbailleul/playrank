import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api/auth';
import type { User } from '../types/index';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatarData: string | File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTokenValid = (token: string) => {
    try {
      const [, payload] = token.split('.');
      if (!payload) return false;
      
      const decodedPayload = JSON.parse(atob(payload));
      const expirationTime = decodedPayload.exp * 1000;
      
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await auth.getProfile();
        setUser(data);
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await auth.login(email, password);
      if (!data.token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      console.error('Login error:', err);
      localStorage.removeItem('token');
      setUser(null);
      throw err;
    }
  };

  const register = async (username: string, firstName: string, lastName: string, email: string, password: string) => {
    try {
      const { data } = await auth.register(username, firstName, lastName, email, password);
      if (!data.token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      console.error('Registration error:', err);
      localStorage.removeItem('token');
      setUser(null);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
    }
  };

  const updateUserAvatar = async (avatarData: string | File) => {
    try {
      const { data } = await auth.updateAvatar(avatarData);
      setUser(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : null);
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 