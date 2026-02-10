export interface SRTFile {
  path: string;
  name: string;
  size: number;
}

export interface SubtitleEntry {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export enum TranslationStatus {
  PENDING = "pending",
  TRANSLATING = "translating",
  COMPLETED = "completed",
  ERROR = "error",
}

export interface FileTranslationState {
  file: SRTFile;
  status: TranslationStatus;
  progress: number;
  error?: string;
}
