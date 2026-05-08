export type TransactionType = 'buy' | 'sell' | 'fee' | 'adjustment' | 'credit' | 'scratch';

export interface Transaction {
  id: string;
  created_at: string;
  product_name: string;
  type: TransactionType;
  amount: number;
  quantity: number;
  date: string;
  notes?: string;
  inventory_id?: string;
}

export interface InventoryItem {
  id: string;
  product_name: string;
  purchase_price: number;
  purchase_date: string;
  quantity: number;
  status: 'available' | 'sold' | 'partial';
  current_value?: number;
}

export interface PortfolioStats {
  totalInvested: number;
  totalIncome: number;
  netProfit: number;
  roi: number;
}
