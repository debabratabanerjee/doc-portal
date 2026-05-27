'use client';

import { useState } from 'react';
import { Download, Eye, FileText, Calendar, Tag, User, Hash, Building2, HardDrive } from 'lucide-react';
import { FileRecord } from '@/lib/types';
import { cn, formatBytes, formatDate, getFileIcon, isPreviewable } from '@/lib/utils';

type FileCardProps = {
  file: FileRecord;
  onDownload: (storagePath: string, fileName: string) => void;
  onPreview?: (storagePath: string, fileName: string) => void;
};

export function FileCard({ file, onDownload, onPreview }: FileCardProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    await onDownload(file.storage_path, file.file_name);
    setDownloading(false);
  }

  const previewable = isPreviewable(file.file_name);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all duration-200 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0 mt-0.5">{getFileIcon(file.file_name)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm" title={file.file_name}>
            {file.file_name}
          </p>
          {file.file_size && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatBytes(file.file_size)}</p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <MetaRow icon={<Hash className="w-3.5 h-3.5" />} label={file.reference_id} />
        <MetaRow icon={<Building2 className="w-3.5 h-3.5" />} label={file.client_name} />
        <MetaRow icon={<HardDrive className="w-3.5 h-3.5" />} label={`Drive Year ${file.record_year}`} />
        <MetaRow icon={<User className="w-3.5 h-3.5" />} label={file.user_name} />
        <MetaRow icon={<Tag className="w-3.5 h-3.5" />} label={file.email} />
        <MetaRow icon={<Calendar className="w-3.5 h-3.5" />} label={formatDate(file.uploaded_at)} />
        {file.notes && (
          <MetaRow icon={<FileText className="w-3.5 h-3.5" />} label={file.notes} className="line-clamp-2" />
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            downloading
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? 'Preparing…' : 'Download'}
        </button>

        {previewable && onPreview && (
          <button
            onClick={() => onPreview(file.storage_path, file.file_name)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
      <span className="flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500">{icon}</span>
      <span className={cn('truncate', className)}>{label}</span>
    </div>
  );
}
