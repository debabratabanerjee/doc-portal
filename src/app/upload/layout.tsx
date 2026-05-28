'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { DemoBanner } from '@/components/DemoBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('darkMode');
    const enabled = stored === 'true';
    setDarkMode(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace('/login');
      return;
    }
    if (mounted && !loading && user?.role === 'client') {
      router.replace('/client');
    }
  }, [mounted, loading, user, router]);

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  }

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <Navbar user={user} onLogout={logout} darkMode={darkMode} onToggleDark={toggleDark} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        DocPortal Demo · Not for production use ·{' '}
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          Powered by Supabase
        </a>
      </footer>
    </div>
  );
}
