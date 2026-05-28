'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SearchParams } from '@/lib/types';

type SearchBarProps = {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
  mode?: 'auditor' | 'client';
};

export function SearchBar({ onSearch, loading, mode = 'auditor' }: SearchBarProps) {
  const currentYear = new Date().getFullYear();
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [lastNYears, setLastNYears] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      clientName: clientName.trim(),
      email: email.trim(),
      userName: userName.trim(),
      referenceId: referenceId.trim(),
      fileName: fileName.trim(),
      fromYear: fromYear ? Number(fromYear) : undefined,
      toYear: toYear ? Number(toYear) : undefined,
      lastNYears: lastNYears ? Number(lastNYears) : undefined,
    });
  }

  function handleClear() {
    setClientName('');
    setEmail('');
    setUserName('');
    setReferenceId('');
    setFileName('');
    setFromYear('');
    setToYear('');
    setLastNYears('');
    onSearch({});
  }

  const hasValues = clientName || email || userName || referenceId || fileName || fromYear || toYear || lastNYears;
  const isClientMode = mode === 'client';

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {!isClientMode && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Search by client..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        )}
        {!isClientMode && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Search by email…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        )}
        {!isClientMode && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">User Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Search by name…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Search by file name..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reference ID</label>
          <input
            type="text"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. REF-1042…"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Year</label>
          <input
            type="number"
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value)}
            placeholder="2022"
            min={2000}
            max={currentYear + 1}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Year</label>
          <input
            type="number"
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            placeholder={String(currentYear)}
            min={2000}
            max={currentYear + 1}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last N Years</label>
          <input
            type="number"
            value={lastNYears}
            onChange={(e) => setLastNYears(e.target.value)}
            placeholder="3"
            min={1}
            max={20}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching…' : 'Search'}
        </button>
        {hasValues && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
