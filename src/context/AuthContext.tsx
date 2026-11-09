import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto } from '../types';
import { authApi } from '../api/authApi';
import { meApi } from '../api/meApi';
import {
  getStoredTokens,
  getDemoMode,
  setDemoMode,
  getBaseUrl,
  setBaseUrl,
} from '../api/client';
import { mockUser } from '../api/mockData';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  baseUrl: string;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  toggleDemoMode: (enabled: boolean) => Promise<void>;
  updateBaseUrl: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(true);
  const [baseUrl, setBaseUrlState] = useState<string>('');

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const demo = await getDemoMode();
      setIsDemoModeState(demo);

      const currentUrl = await getBaseUrl();
      setBaseUrlState(currentUrl);

      const { accessToken } = await getStoredTokens();
      if (accessToken || demo) {
        // In demo mode or if tokens exist, fetch user
        const userData = await meApi.getMe();
        setUser(userData);
      }
    } catch (err) {
      console.warn('Init auth failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (phone: string) => {
    const res = await authApi.requestOtp(phone);
    return { success: res.success, message: res.message };
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    const res = await authApi.verifyOtp(phone, otp);
    if (res.success && res.user) {
      setUser(res.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateProfile = async (name: string, email: string) => {
    const updated = await meApi.updateMe({ name, email });
    setUser(updated);
  };

  const toggleDemoMode = async (enabled: boolean) => {
    await setDemoMode(enabled);
    setIsDemoModeState(enabled);
    if (enabled) {
      setUser(mockUser);
    } else {
      // Re-check live auth
      try {
        const userData = await meApi.getMe();
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
  };

  const updateBaseUrl = async (url: string) => {
    await setBaseUrl(url);
    setBaseUrlState(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode,
        baseUrl,
        requestOtp,
        verifyOtp,
        logout,
        updateProfile,
        toggleDemoMode,
        updateBaseUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

