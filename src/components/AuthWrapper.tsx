import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase, supabaseApi } from '../utils/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  clearError: () => void;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        setError(null);
        console.log('Initializing application...');
        
        // First, check if the server is healthy
        try {
          console.log('Checking server health...');
          const healthResult = await supabaseApi.healthCheck();
          console.log('Server health check result:', healthResult);
        } catch (healthError) {
          console.log('Server health check failed (this is expected if server is not deployed). Continuing with offline mode.');
          // Don't treat this as an error - the app can work in offline/demo mode
        }
        
        // Check if demo accounts exist (don't auto-initialize to avoid timing conflicts)
        try {
          console.log('Checking demo account status...');
          const statusResult = await supabaseApi.demoStatus();
          const existingCount = statusResult.accounts.filter(acc => 
            acc.status === 'exists' || acc.status === 'offline'
          ).length;
          console.log(`Found ${existingCount}/3 demo accounts (including offline accounts)`);
          
          if (existingCount === 0) {
            console.log('No demo accounts found - user can initialize them manually from landing page');
          }
        } catch (demoError) {
          console.log('Could not check demo status (continuing with offline mode):', demoError.message);
          // Don't treat network errors as application errors
        }
        
        // Check for existing session
        console.log('Checking for existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to check authentication status');
        } else if (session?.user) {
          console.log('Found existing session for user:', session.user.email);
          console.log('AuthWrapper Debug - User metadata:', session.user.user_metadata);
          
          // Determine the role with better logic
          let userRole = session.user.user_metadata?.role || 'individual';
          
          // Special check for admin email
          if (session.user.email === 'souvikkundu7880@gmail.com') {
            console.log('AuthWrapper Debug - Admin email detected, forcing admin role');
            userRole = 'admin';
          }
          
          console.log('AuthWrapper Debug - Final role:', userRole);
          
          const transformedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: userRole,
            hospitalId: session.user.user_metadata?.hospital_id,
            createdAt: session.user.created_at || new Date().toISOString()
          };
          setUser(transformedUser);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Failed to initialize application. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          console.log('Auth state change - User metadata:', session.user.user_metadata);
          
          // Determine the role with better logic
          let userRole = session.user.user_metadata?.role || 'individual';
          
          // Special check for admin email
          if (session.user.email === 'souvikkundu7880@gmail.com') {
            console.log('Auth state change - Admin email detected, forcing admin role');
            userRole = 'admin';
          }
          
          console.log('Auth state change - Final role:', userRole);
          
          const transformedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: userRole,
            hospitalId: session.user.user_metadata?.hospital_id,
            createdAt: session.user.created_at || new Date().toISOString()
          };
          setUser(transformedUser);
          setError(null);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setError(null);
      await supabaseApi.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}