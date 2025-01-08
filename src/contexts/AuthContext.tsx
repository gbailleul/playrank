import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api/auth';
import type { User } from '../types/index';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await auth.getProfile();
        setUser(data);
      } catch (err) {
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
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const { data } = await auth.register(firstName, lastName, email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to logout');
      throw err;
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