import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'x-auth-token': token!,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.name}`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // Demo mode: simulate successful login
      console.warn('Backend not available, using demo mode');
      const demoUser = {
        id: 'demo-user',
        name: 'Demo User',
        email: email,
      };
      const demoToken = 'demo-token-' + Date.now();
      
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('token', demoToken);
      toast({
        title: "Demo Mode",
        description: `Logged in as ${demoUser.name}`,
      });
      return true;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        toast({
          title: "Account created!",
          description: `Welcome, ${data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: "Could not create account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      // Demo mode: simulate successful registration
      console.warn('Backend not available, using demo mode');
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        name: name,
        email: email,
      };
      const demoToken = 'demo-token-' + Date.now();
      
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('token', demoToken);
      toast({
        title: "Demo Mode",
        description: `Welcome, ${demoUser.name}!`,
      });
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};