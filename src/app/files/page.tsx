'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useFiles } from '@/hooks/useFiles';
import { SearchBar } from '@/components/SearchBar';
import { FileCard } from '@/components/FileCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PreviewModal } from '@/components/PreviewModal';
import { SearchParams } from '@/lib/types';
import Link from 'next/link';

const PAGE_SIZE = 12;

export default function FilesPage() {
  const { files, loading, error, searchFiles, fetchRecent, getDownloadUrl } = useFiles();
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    fetchRecent(50);
  }, [fetchRecent]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleSearch(params: SearchParams) {
    const isEmpty =
      !params.clientName &&
      !params.email &&
      !params.userName &&
      !params.referenceId &&
      !params.fileName &&
      !params.fromYear &&
      !params.toYear &&
      !params.lastNYears;
    if (isEmpty) {
      setHasSearched(false);
      fetchRecent(50);
    } else {
      setHasSearched(true);
      setPage(1);
      await searchFiles(params);
    }
  }

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
    setPreview({ url, name: fileName });
  }

  const paginated = files.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(files.length / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Files</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Search by client, year range, email, name, or reference ID. Showing {files.length} result(s).
        </p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {loading ? (
        <LoadingSpinner className="py-12" label="Searching…" />
      ) : paginated.length === 0 ? (
        <EmptyState
          title={hasSearched ? 'No files match your search' : 'No files uploaded yet'}
          description={
            hasSearched
              ? 'Try different search terms or clear the search to see all files.'
              : 'Upload documents to get started.'
          }
          action={
            !hasSearched ? (
              <Link href="/upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Upload Files
              </Link>
            ) : undefined
          }
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
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

      {preview && (
        <PreviewModal url={preview.url} fileName={preview.name} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
