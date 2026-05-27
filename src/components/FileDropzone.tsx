'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import { cn, formatBytes, getFileIcon } from '@/lib/utils';

type FileDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
};

export function FileDropzone({ files, onChange, maxFiles = 10, maxSizeMB = 25 }: FileDropzoneProps) {
  const [rejected, setRejected] = useState<string[]>([]);

  const onDrop = useCallback(
    (accepted: File[], fileRejections: FileRejection[]) => {
      setRejected(fileRejections.map((r) => `${r.file.name}: ${r.errors[0]?.message}`));
      onChange([...files, ...accepted].slice(0, maxFiles));
    },
    [files, onChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSizeMB * 1024 * 1024,
    maxFiles,
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn('w-10 h-10 mx-auto mb-3', isDragActive ? 'text-blue-500' : 'text-gray-400')} />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {isDragActive ? 'Drop files here…' : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Up to {maxFiles} files · Max {maxSizeMB}MB each
        </p>
      </div>

      {rejected.length > 0 && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 space-y-1">
          {rejected.map((msg, i) => (
            <p key={i} className="text-xs text-red-600 dark:text-red-400">{msg}</p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-slide-up"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0">{getFileIcon(file.name)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="flex-shrink-0 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <FileText className="w-3.5 h-3.5" />
          No files selected
        </div>
      )}
    </div>
  );
}
