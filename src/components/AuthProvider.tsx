
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.email || 'no user');
          setSession(session);
          setUser(session?.user ?? null);
          
          // When user signs in, ensure their role is properly set in JWT claims
          if (event === 'SIGNED_IN' && session?.user) {
            await ensureUserRoleInClaims(session.user);
          }
          
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          console.log('Initial session:', session?.user?.email || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Ensure role is properly set for existing session
          if (session?.user) {
            await ensureUserRoleInClaims(session.user);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserRoleInClaims = async (user: User) => {
    try {
      console.log('AuthProvider: Ensuring role in claims for user:', user.email);
      
      // Determine role based on email or database
      let role = 'parent'; // default
      
      if (user.email === 'admin@admin.com') {
        role = 'admin';
      } else if (user.email === 'kasir@kasir.com') {
        role = 'cashier';
      } else {
        // Check user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleData?.role) {
          role = roleData.role;
        }
      }

      console.log('AuthProvider: Determined role:', role, 'for user:', user.email);

      // Update user metadata to include role
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: role }
      });

      if (updateError) {
        console.error('AuthProvider: Error updating user metadata:', updateError);
      } else {
        console.log('AuthProvider: Successfully updated user metadata with role:', role);
      }

    } catch (error) {
      console.error('AuthProvider: Error in ensureUserRoleInClaims:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
