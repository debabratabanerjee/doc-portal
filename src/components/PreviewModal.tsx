'use client';

import { X, ZoomIn } from 'lucide-react';
import { useEffect } from 'react';

type PreviewModalProps = {
  url: string;
  fileName: string;
  onClose: () => void;
};

export function PreviewModal({ url, fileName, onClose }: PreviewModalProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{fileName}</h3>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
              title="Open in new tab"
            >
              <ZoomIn className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 bg-gray-50 dark:bg-gray-950">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={fileName} className="max-w-full mx-auto rounded-lg object-contain max-h-[75vh]" />
          )}
          {isPdf && (
            <iframe src={url} title={fileName} className="w-full h-[75vh] rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}
