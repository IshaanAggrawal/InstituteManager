'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session on initial load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Listen for auth changes across all tabs
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          // Handle SIGNED_OUT event specifically for cross-tab logout
          if (event === 'SIGNED_OUT') {
            setUser(null);
            // Only redirect in the current tab if it's not already on the home page
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
              router.push('/');
              router.refresh();
            }
          } else {
            // Handle other events (SIGNED_IN, TOKEN_REFRESHED, etc.)
            setUser(session?.user || null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Redirect to dashboard after successful login
      router.push('/dashboard');
      router.refresh();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Redirect to dashboard after successful signup
      router.push('/dashboard');
      router.refresh();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase (this will trigger SIGNED_OUT event across all tabs)
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error:', error);
        // Still proceed with local cleanup even if there's an error
      }
      
      // Update local state to reflect logged-out status
      // This will automatically update the navbar via context
      setUser(null);
      
      // Redirect to home page after successful logout
      router.push('/');
      router.refresh(); // Ensure router state is updated
    } catch (error) {
      console.error('Error during logout:', error);
      // Still update state and redirect to maintain UX consistency
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}