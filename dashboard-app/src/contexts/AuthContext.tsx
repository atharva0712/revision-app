import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the shape of the user object and auth state
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { authService } from '../services/authService';

// Helper function to get token and user from localStorage
const getStoredAuth = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  return { token, user };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getStoredAuth().token);
  const [user, setUser] = useState<User | null>(getStoredAuth().user);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUrlToken = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get('token');

      if (urlToken) {
        // Clean the URL
        window.history.replaceState({}, document.title, window.location.pathname);

        try {
          const data = await authService.getMe(urlToken);
          if (data.success) {
            login(urlToken, data.user);
          } else {
            // Handle case where token is invalid
            logout();
          }
        } catch (error) {
          console.error('Error validating token', error);
          logout();
        }
      } else {
        setIsLoading(false);
      }
    };

    handleUrlToken();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
