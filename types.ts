export interface KeyValuePair {
  key: string;
  value: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiConfig {
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  body?: string | FormData; // Updated to support file uploads
  useProxy?: boolean;
}

export interface ApiResponse {
  success: boolean;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  duration: number; // in milliseconds
  error?: string;
}