import { useCallback } from 'react';

// Token management functions
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hirehub-token');
  }
  return null;
};

const setStoredToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hirehub-token', token);
  }
};

const removeStoredToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hirehub-token');
  }
};

export const useAuth = () => {
  const getAuthHeader = useCallback(() => {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const setToken = useCallback((token: string) => {
    setStoredToken(token);
  }, []);

  const clearToken = useCallback(() => {
    removeStoredToken();
  }, []);

  return {
    getAuthHeader,
    setToken,
    clearToken,
    hasToken: !!getStoredToken()
  };
};
