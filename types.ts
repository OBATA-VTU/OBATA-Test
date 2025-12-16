export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  walletBalance: number;
  isReseller: boolean;
  isAdmin: boolean;
  phoneNumber?: string;
  transactionPin?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type TransactionType = 'DEPOSIT' | 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  reference: string;
  metadata?: {
    network?: string;
    phoneNumber?: string;
    planId?: string;
    token?: string;
    meterNumber?: string;
    recipientName?: string;
  };
  date: any; // Firestore Timestamp
}

export interface ServicePlan {
  id: string;
  category: 'DATA' | 'CABLE' | 'EDUCATION';
  provider: string; // MTN, DSTV, WAEC
  name: string; // 1GB SME
  price: number;
  resellerPrice: number;
  apiId: string; // ID for Inlomax/Provider
  validity?: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  announcement?: string;
  isMaintenanceMode: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface ApiConfig {
  url: string;
  method: string;
  headers: KeyValuePair[];
  body?: string | FormData;
  useProxy?: boolean;
}

export interface ApiResponse {
  success: boolean;
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  duration: number;
  error?: string;
}