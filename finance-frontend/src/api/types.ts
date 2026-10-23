export type Currency = 'rub' | 'usd' | 'eur';
export type OperationType = 'expense' | 'income' | 'transfer';

export interface Wallet {
  id: number;
  name: string;
  balance: string;
  currency: Currency;
}

export interface Operation {
  id: number;
  wallet_id: number;
  type: OperationType;
  amount: string;
  currency: string;
  category: string | null;
  subcategory: string | null;
  created_at: string;
}