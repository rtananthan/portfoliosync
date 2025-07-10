import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthState, User } from '../services/authService';

interface AuthContextType {
  authState: AuthState;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string>;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newAuthState) => {
      console.log('Auth state changed:', newAuthState);
      setAuthState(newAuthState);
    });

    // Get initial auth state
    const initialState = authService.getAuthState();
    console.log('Initial auth state:', initialState);
    setAuthState(initialState);

    // Failsafe: if still loading after 5 seconds, force stop loading
    const timeout = setTimeout(() => {
      setAuthState(current => {
        if (current.loading) {
          console.warn('Auth initialization timed out, forcing stop loading');
          return { ...current, loading: false, error: 'Authentication initialization timed out' };
        }
        return current;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  const refreshToken = async () => {
    return await authService.refreshToken();
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    return await authService.updateUserProfile(updates);
  };

  const value: AuthContextType = {
    authState,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    token: authState.token,
    signOut,
    refreshToken,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};