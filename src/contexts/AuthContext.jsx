import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        // Try to refresh token if exists
        if (authService.isAuthenticated) {
          await authService.refresh();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setUser(authService.currentUser);
        setIsAuthenticated(authService.isAuthenticated);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const unsubscribe = authService.onAuthChange((token, model) => {
      setUser(model);
      setIsAuthenticated(!!token && !!model);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signUp = async (email, password, passwordConfirm, userData = {}) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(email, password, passwordConfirm, userData);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const requestPasswordReset = async (email) => {
    return await authService.requestPasswordReset(email);
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    return await authService.confirmPasswordReset(token, password, passwordConfirm);
  };

  const updateProfile = async (data) => {
    setIsLoading(true);
    try {
      const result = await authService.updateProfile(data);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGitHub();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithDiscord = async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithDiscord();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithOAuth(provider);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    signInWithGoogle,
    signInWithGitHub,
    signInWithDiscord,
    signInWithOAuth,
    authService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};