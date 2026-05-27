'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Upload as UploadIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUpload } from '@/hooks/useUpload';
import { FileDropzone } from '@/components/FileDropzone';
import { isValidEmail } from '@/lib/utils';

type FormData = {
  clientName: string;
  recordYear: number;
  userName: string;
  email: string;
  notes: string;
  files: File[];
};

const CURRENT_YEAR = new Date().getFullYear();
const INITIAL: FormData = {
  clientName: '',
  recordYear: CURRENT_YEAR,
  userName: '',
  email: '',
  notes: '',
  files: [],
};

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { status, progress, error, uploadFiles, reset } = useUpload();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [emailError, setEmailError] = useState('');

  // Pre-fill from session user
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, userName: user.displayName, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function validateEmail(val: string) {
    setEmailError(!val || isValidEmail(val) ? '' : 'Please enter a valid email address');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.files.length) { toast.error('Please select at least one file'); return; }
    if (emailError) { toast.error('Please fix email format'); return; }
    if (!form.clientName.trim()) { toast.error('Client name is required'); return; }
    if (form.recordYear < 2000 || form.recordYear > CURRENT_YEAR + 1) {
      toast.error('Please enter a valid record year');
      return;
    }

    const result = await uploadFiles(
      {
        clientName: form.clientName,
        recordYear: form.recordYear,
        userName: form.userName,
        email: form.email,
        notes: form.notes,
        files: form.files,
      },
      user?.displayName ?? 'anonymous'
    );

    if (result) {
      toast.success(`${result.length} file(s) uploaded successfully!`);
    }
  }

  function handleReset() {
    setForm(INITIAL);
    if (user) {
      setForm({
        clientName: '',
        recordYear: CURRENT_YEAR,
        userName: user.displayName,
        email: user.email,
        notes: '',
        files: [],
      });
    }
    reset();
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Successful!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {form.files.length} file(s) have been uploaded and stored in Supabase.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Upload More
          </button>
          <button
            onClick={() => router.push('/files')}
            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 transition-colors"
          >
            View Files
          </button>
        </div>
      </div>
    );
  }

  const uploading = status === 'uploading';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Documents</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Tag each upload with client and year to simulate yearly hard drives. A reference ID is auto-generated.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User info card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white text-sm uppercase tracking-wide">
            File Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setField('clientName', e.target.value)}
                required
                placeholder="e.g. Acme Industries"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Record Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.recordYear}
                onChange={(e) => setField('recordYear', Number(e.target.value) || CURRENT_YEAR)}
                min={2000}
                max={CURRENT_YEAR + 1}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>

          <h2 className="font-semibold text-gray-800 dark:text-white text-sm uppercase tracking-wide">
            Uploader Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                User Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => setField('userName', e.target.value)}
                required
                placeholder="Full name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setField('email', e.target.value); validateEmail(e.target.value); }}
                required
                placeholder="you@example.com"
                className={`w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm ${
                  emailError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Notes / Description
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={3}
              placeholder="Optional description or tags for this upload…"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm resize-none"
            />
          </div>
        </div>

        {/* File dropzone card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-white text-sm uppercase tracking-wide mb-3">
            Files
          </h2>
          <FileDropzone
            files={form.files}
            onChange={(files) => setField('files', files)}
          />
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300 mb-2">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || form.files.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <UploadIcon className="w-4 h-4" />
          {uploading ? `Uploading… ${progress}%` : `Upload ${form.files.length > 0 ? form.files.length + ' file(s)' : 'Files'}`}
        </button>
      </form>
    </div>
  );
}
