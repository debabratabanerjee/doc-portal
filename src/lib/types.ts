export type FileRecord = {
  id: string;
  reference_id: string;
  client_name: string;
  record_year: number;
  user_name: string;
  email: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
  notes: string | null;
  uploaded_by: string;
  file_size: number | null;
  file_type: string | null;
  doc_type?: string | null;
  request_id?: string | null;
};

export type DemoUser = {
  id: string;
  displayName: string;
  email: string;
  role: 'auditor' | 'client';
};

export type UploadFormData = {
  clientName: string;
  recordYear: number;
  userName: string;
  email: string;
  notes: string;
  files: File[];
  docType?: string;
  requestId?: string;
};

export type SearchParams = {
  clientName?: string;
  email?: string;
  userName?: string;
  referenceId?: string;
  fileName?: string;
  fromYear?: number;
  toYear?: number;
  lastNYears?: number;
};

export type ClientUploadRequest = {
  id: string;
  clientName: string;
  title: string;
  details: string;
  createdAt: string;
  createdBy: string;
  status: 'open' | 'completed';
};

export const GOV_DOC_TYPES = [
  'Aadhar',
  'PAN',
  'ITR',
  'Form 16',
  'Bank Statement',
  'Passport',
  'Driving License',
  'Voter ID',
  'GST Certificate',
  'Other',
];
