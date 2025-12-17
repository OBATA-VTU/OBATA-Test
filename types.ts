
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'reseller' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  role: UserRole;
  isAdmin: boolean; // Matches firestore rule check: .data.isAdmin == true
  walletBalance: number;
  commissionBalance: number;
  savingsBalance: number;
  referralCode: string;
  referredBy?: string | null;
  transactionPin?: string;
  apiKey?: string;
  photoURL?: string | null;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  loginStreak?: number;
  emailNotifications: boolean;
  banned: boolean;
  isReseller?: boolean;
  hasFunded?: boolean;
  hasMadePurchase?: boolean;
  totalPurchaseValue?: number;
  pendingUpgrade?: boolean;
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type TransactionType = 'FUNDING' | 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION' | 'TRANSFER' | 'WITHDRAWAL' | 'COMMISSION' | 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  reference: string;
  metadata?: any;
  date: Timestamp;
  previousBalance?: number;
  newBalance?: number;
  proofUrl?: string;
  userEmail?: string;
  method?: string;
  destination?: string;
  bankDetails?: any;
}

export interface ServicePlan {
  id: string;
  category: 'DATA' | 'CABLE' | 'EDUCATION';
  provider: string;
  name: string;
  price: number;
  resellerPrice: number;
  apiId: string;
  validity?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  duration?: number;
  error?: string;
}

export interface ApiConfig {
  url: string;
  method: string;
  headers?: {key: string, value: string}[];
  body?: any;
}

export type PageView = 'LANDING' | 'PRICING_PUBLIC' | 'SUPPORT';
export type DashboardTab = 'OVERVIEW' | 'WALLET' | 'SAVINGS' | 'REWARDS' | 'HISTORY' | 'RESELLER' | 'SERVICES' | 'PROFILE';

// Added missing Notification interface to fix AppDataContext error
export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
  title: string;
  message: string;
  date: Timestamp;
  read: boolean;
  target: 'ALL' | string;
}
