export interface CreditBoostConfig {
  baseURL?: string;
  timeout?: number;
  apiKey?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  weeklyReport: boolean;
  securityAlerts: boolean;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
}

export interface CreditReport {
  score: number;
  history: Array<{
    date: string;
    score: number;
    change: number;
  }>;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative';
    description: string;
  }>;
}

export interface AccountDetails {
  id: string;
  type: 'credit' | 'loan' | 'utility';
  provider: string;
  status: 'active' | 'closed';
  balance: number;
  lastReported: string;
}