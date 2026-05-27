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
};

export type DemoUser = {
  id: string;
  displayName: string;
  email: string;
};

export type UploadFormData = {
  clientName: string;
  recordYear: number;
  userName: string;
  email: string;
  notes: string;
  files: File[];
};

export type SearchParams = {
  clientName?: string;
  email?: string;
  userName?: string;
  referenceId?: string;
  fromYear?: number;
  toYear?: number;
  lastNYears?: number;
};
