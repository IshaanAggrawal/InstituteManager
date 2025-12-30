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
    const checkSession = async () => {
      try {
        console.log("Checking Supabase session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error("Session check error:", error);
        }

        if (session) {
            console.log("User found:", session.user.email);
            setUser(session.user);
        } else {
            console.log("No active session.");
            setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error checking session:", err);
      } finally {
        setLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth Event:", event);
          if (event === 'SIGNED_OUT') {
            setUser(null);
            router.push('/');
            router.refresh();
          } else if (session) {
            setUser(session.user);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    checkSession();
  }, [router]);

  const login = async (email: string, password: string) => {
    console.log("Attempting login for:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login Supabase Error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("Login Successful:", data);
      return { success: true };
    } catch (error: any) {
      console.error("Login Exception:", error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string) => {
    console.log("Attempting signup for:", email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup Supabase Error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("Signup Successful:", data);
      return { success: true };
    } catch (error: any) {
      console.error("Signup Exception:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
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