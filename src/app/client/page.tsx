'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, FileQuestion } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUpload } from '@/hooks/useUpload';
import { useFiles } from '@/hooks/useFiles';
import { useClientRequests } from '@/hooks/useClientRequests';
import { FileDropzone } from '@/components/FileDropzone';
import { SearchBar } from '@/components/SearchBar';
import { FileCard } from '@/components/FileCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { PreviewModal } from '@/components/PreviewModal';
import { SearchParams, GOV_DOC_TYPES } from '@/lib/types';
import { Upload as UploadIcon } from 'lucide-react';

const CLIENT_NAME = 'RAM';
const PAGE_SIZE = 8;
const CURRENT_YEAR = new Date().getFullYear();

export default function ClientPage() {
  const { user } = useAuth();
  const { status, progress, error: uploadError, uploadFiles, reset } = useUpload();
  const { files, loading, error, searchFiles, fetchRecent, getDownloadUrl } = useFiles();
  const { requests, markCompleted, refresh: refreshRequests } = useClientRequests();

  const [recordYear, setRecordYear] = useState(CURRENT_YEAR);
  const [notes, setNotes] = useState('');
  const [docType, setDocType] = useState('Other');
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);

  // Poll for real-time request updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRequests();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshRequests]);

  const clientRequests = requests.filter((request) => request.clientName.toLowerCase() === CLIENT_NAME.toLowerCase());

  useEffect(() => {
    searchFiles({ clientName: CLIENT_NAME });
  }, [searchFiles]);

  useEffect(() => {
    if (uploadError) toast.error(uploadError);
  }, [uploadError]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleUploadForRequest() {
    if (!filesToUpload.length) {
      toast.error('Please select at least one file');
      return;
    }

      const result = await uploadFiles(
      {
        clientName: CLIENT_NAME,
        recordYear,
        userName: user?.displayName || CLIENT_NAME,
        email: user?.email || '',
        notes,
        docType,
        requestId: uploadingRequestId || undefined,
        files: filesToUpload,
      },
      user?.displayName ?? CLIENT_NAME
    );

    if (result) {
      toast.success(`${result.length} file(s) uploaded for ${CLIENT_NAME}`);
      await refreshRequests();
      await fetchRecent(50);
      setFilesToUpload([]);
      setNotes('');
      setDocType('Other');
      reset();
      setUploadingRequestId(null);
    }
  }

  async function handleSearch(params: SearchParams) {
    setPage(1);
    const isEmpty = !params.referenceId && !params.fileName && !params.fromYear && !params.toYear && !params.lastNYears;
    if (isEmpty) {
      await searchFiles({ clientName: CLIENT_NAME });
      return;
    }

    await searchFiles({
      ...params,
      clientName: CLIENT_NAME,
      email: undefined,
      userName: undefined,
    });
  }

  async function handleDownload(storagePath: string, fileName: string) {
    const url = await getDownloadUrl(storagePath);
    if (!url) {
      toast.error('Could not generate download link');
      return;
    }
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
    setPreview({ url, name: fileName });
  }

  const paginated = files.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(files.length / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{CLIENT_NAME} Client Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          View auditor requests, upload requested files, and search only {CLIENT_NAME} documents.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 mb-3">
          Requests From Auditor
        </h2>
        {clientRequests.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            No pending requests from auditor.
          </div>
        ) : (
          <div className="space-y-3">
            {clientRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{request.title}</p>
                  {request.details && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{request.details}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Requested by {request.createdBy} on {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                {request.status === 'completed' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                    type="button"
                    onClick={() => setUploadingRequestId(request.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1"
                  >
                    <UploadIcon className="w-4 h-4" /> Upload Files
                  </button>
                    <button
                     type="button"
                    onClick={async () => {
                      await markCompleted(request.id);
                      toast.success('Marked request as completed');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    Mark Completed
                  </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {uploadingRequestId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Upload Files for Request</h3>
              <button
                onClick={() => setUploadingRequestId(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUploadForRequest();
              }}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Client</label>
                  <input
                    type="text"
                    value={CLIENT_NAME}
                    readOnly
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Record Year</label>
                  <input
                    type="number"
                    value={recordYear}
                    onChange={(e) => setRecordYear(Number(e.target.value) || CURRENT_YEAR)}
                    min={2000}
                    max={CURRENT_YEAR + 1}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {GOV_DOC_TYPES.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <FileDropzone files={filesToUpload} onChange={setFilesToUpload} />
              {status === 'uploading' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-3">
                  <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300 mb-2">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={status === 'uploading' || filesToUpload.length === 0}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium transition-colors"
                >
                  {status === 'uploading' ? `Uploading... ${progress}%` : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setUploadingRequestId(null)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{CLIENT_NAME} Files</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Search using file metadata only.</p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} mode="client" />

        {loading ? (
          <LoadingSpinner className="py-10" label="Loading files..." />
        ) : paginated.length === 0 ? (
          <EmptyState
            title="No client files found"
            description="Upload files or adjust your search filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {preview && <PreviewModal url={preview.url} fileName={preview.name} onClose={() => setPreview(null)} />}
    </div>
  );
}
