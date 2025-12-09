export interface SME {
  id: string; // Primary Key
  name: string;
  phone: string;
  toolGiven: string;
  totalCost: number;
  dailyRate: number;
  // Derived fields (calculated at runtime usually, but defined here for UI ease)
  totalPaid?: number;
  balance?: number;
  status?: 'Active' | 'Paid Off';
}

export interface Transaction {
  receiptId: string; // Unique ID (e.g., R-101)
  date: string;
  smeId: string;
  amountPaid: number;
  collectorName: string;
}

export type ViewState = 'dashboard' | 'master-db' | 'daily-log';

export interface SMEStats {
  totalPaid: number;
  balance: number;
  status: 'Active' | 'Paid Off';
  progress: number;
}