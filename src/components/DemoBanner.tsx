'use client';

import { AlertTriangle } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="w-full bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">Demo Application</span>
        <span className="text-amber-600 dark:text-amber-400">—</span>
        <span>Restricted Supabase Login Enabled. Not for production use.</span>
      </div>
    </div>
  );
}
