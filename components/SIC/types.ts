
export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  targetFormat?: string;
  resultUrl?: string;
  error?: string;
}

export type SupportedFormat = string;

export interface AppState {
  images: ImageFile[];
  verbose: boolean;
  isConverting: boolean;
  globalTargetFormat: SupportedFormat;
  formatSearch: string;
  logs: string[];
}

export interface ConversionResult {
  url: string;
  blob: Blob;
  filename: string;
}
