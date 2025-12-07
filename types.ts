export interface FileRecord {
  name: string;
  type: string;
  data: string; // Base64 string
}

export interface PatientInfo {
  name?: string;
  age?: string;
  gender?: string;
  diagnosis?: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  files: FileRecord[];
  patientInfo?: PatientInfo;
  analysisResult: string;
  summary?: string; // Short summary for list view
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  HISTORY = 'HISTORY',
  DETAILS = 'DETAILS',
  COMPARISON = 'COMPARISON'
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  currentResult: string | null;
}