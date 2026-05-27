import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReferenceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `REF-${num}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊',
    ppt: '📋', pptx: '📋',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
    mp4: '🎥', mov: '🎥', avi: '🎥',
    mp3: '🎵', wav: '🎵',
    zip: '🗜️', rar: '🗜️',
    txt: '📃',
    csv: '📊',
  };
  return icons[ext] ?? '📁';
}

export function isPreviewable(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(ext);
}

export function getStoragePath(email: string, clientName: string, recordYear: number, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9._-]/g, '_');
  const sanitizedClient = clientName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${recordYear}/${sanitizedClient}/${sanitizedEmail}/${timestamp}_${fileName}`;
}
