import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'reseller' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  role: UserRole;
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
  isReseller?: boolean; // Added for compatibility
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
  provider: string; // MTN, DSTV, WAEC
  name: string;
  price: number;
  resellerPrice: number;
  apiId: string;
  validity?: string;
}

export interface SavingsPlan {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  interestRate: number; // Annual percentage
  dailyInterest: number;
  startDate: Timestamp;
  maturityDate: Timestamp;
  isLocked: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'BROKEN';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  date: Timestamp;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface ApiConfig {
  url: string;
  method: string;
  headers?: KeyValuePair[];
  body?: any;
  useProxy?: boolean;
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

export type PageView = 'LANDING' | 'PRICING_PUBLIC' | 'SUPPORT';
export type DashboardTab = 'OVERVIEW' | 'WALLET' | 'SAVINGS' | 'REWARDS' | 'HISTORY' | 'RESELLER' | 'SERVICES' | 'PROFILE';