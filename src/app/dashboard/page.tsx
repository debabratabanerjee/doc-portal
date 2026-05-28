'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, Search, FileText, Clock, Users, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { useClientRequests } from '@/hooks/useClientRequests';
import { FileCard } from '@/components/FileCard';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatBytes } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, loading, error, fetchRecent, getDownloadUrl } = useFiles();
  const { requests, createRequest, refresh: refreshRequests } = useClientRequests();
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDetails, setRequestDetails] = useState('');

  // Real-time polling for request and file updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRequests();
      fetchRecent(10, { silent: true });
    }, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [refreshRequests, fetchRecent]);

  useEffect(() => {
    fetchRecent(10);
  }, [fetchRecent]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleDownload(storagePath: string, fileName: string) {
    const url = await getDownloadUrl(storagePath);
    if (!url) { toast.error('Could not generate download link'); return; }
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      toast.error('Popup blocked. Please allow popups for downloads.');
      return;
    }
    toast.success(`Downloading ${fileName}`);
  }

  async function handlePreview(storagePath: string, fileName: string) {
    const url = await getDownloadUrl(storagePath);
    if (!url) {
      toast.error('Could not generate preview link');
      return;
    }
    setPreviewFile({ url, name: fileName });
  }

  const totalSize = files.reduce((acc, f) => acc + (f.file_size ?? 0), 0);
  const uniqueClients = new Set(files.map((f) => f.client_name)).size;

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!requestTitle.trim()) {
      toast.error('Request title is required');
      return;
    }
    await createRequest({
      clientName: 'RAM',
      title: requestTitle.trim(),
      details: requestDetails.trim(),
      createdBy: user?.displayName ?? 'Auditor',
    });
    setRequestTitle('');
    setRequestDetails('');
    toast.success('Upload request sent to RAM dashboard');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.displayName} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here&apos;s a summary of recent document activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Recent Files"
          value={files.length}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Unique Clients"
          value={uniqueClients}
          icon={<Users className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Storage Used"
          value={formatBytes(totalSize)}
          icon={<HardDrive className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Last Upload"
          value={files[0] ? new Date(files[0].uploaded_at).toLocaleDateString() : '—'}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 mb-3">
          Request Files From Client (RAM)
        </h2>
        <form onSubmit={handleCreateRequest} className="space-y-3">
          <input
            type="text"
            value={requestTitle}
            onChange={(e) => setRequestTitle(e.target.value)}
            placeholder="e.g. Upload ITR and bank statements for FY 2025"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <textarea
            value={requestDetails}
            onChange={(e) => setRequestDetails(e.target.value)}
            rows={3}
            placeholder="Optional details for RAM about expected documents or naming format..."
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Send Request To RAM
          </button>
        </form>

            {/* RAM request status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 mb-3">
                Pending Requests from RAM
              </h2>
              {requests.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No requests sent yet.</p>
              ) : (
                <div className="space-y-2">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-start justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{request.title}</p>
                        {request.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{request.details}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {request.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/upload"
          className="flex items-center gap-4 p-5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold">Upload Documents</p>
            <p className="text-blue-100 text-sm">Drag & drop files with metadata</p>
          </div>
        </Link>
        <Link
          href="/files"
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Search Files</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Find by client, year, email, name, or reference</p>
          </div>
        </Link>
      </div>

      {/* Recent uploads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Uploads</h2>
          <Link href="/files" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" label="Loading recent files…" />
        ) : files.length === 0 ? (
          <EmptyState
            title="No uploads yet"
            description="Upload your first document to get started."
            action={
              <Link href="/upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Upload Now
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-gray-50 dark:bg-gray-950">
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(previewFile.name) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full mx-auto rounded-lg object-contain max-h-[75vh]" />
              ) : (
                <iframe src={previewFile.url} title={previewFile.name} className="w-full h-[75vh] rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
