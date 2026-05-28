'use client';

import { useState, useCallback, useEffect } from 'react';
import { AuthError, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { DemoUser } from '@/lib/types';

function mapUser(user: User): DemoUser {
  const fallbackName = user.email?.split('@')[0] ?? 'User';
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || fallbackName;
  const roleFromMetadata = user.user_metadata?.role;
  const isRamClient = /ram/i.test(displayName) || /ram/i.test(user.email ?? '');
  const role: DemoUser['role'] = roleFromMetadata === 'client' || isRamClient ? 'client' : 'auditor';

  return {
    id: user.id,
    displayName,
    email: user.email ?? '',
    role,
  };
}

export function useAuth() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ? mapUser(data.session.user) : null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      return (error as AuthError).message || 'Login failed';
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, login, logout, loading };
}
