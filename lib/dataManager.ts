import { supabase } from './supabase';
import { Transaction, InventoryItem, PortfolioStats } from '../types/database';

class DataManager {
  // Fetch all transactions from Supabase
  static async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data || [];
  }

  // Fetch all inventory items from Supabase
  static async getInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('status', 'available');

    if (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
    return data || [];
  }

  // Add a new transaction
  static async addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([tx])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    return data;
  }

  // Add to inventory
  static async addToInventory(item: Omit<InventoryItem, 'id'>) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error adding to inventory:', error);
      throw error;
    }
    return data;
  }

  // Remove from inventory
  static async removeFromInventory(product_name: string, purchase_date: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('product_name', product_name)
      .eq('purchase_date', purchase_date)
      .eq('status', 'available');
    return { error };
  }

  // Calculate stats
  static calculateStats(transactions: Transaction[]): PortfolioStats {
    const totalInvested = transactions
      .filter(t => t.type === 'buy' || t.type === 'scratch' || t.type === 'collection')
      .reduce((sum, t) => sum + (t.amount * t.quantity), 0);

    const totalIncome = transactions
      .filter(t => t.type === 'sell' || t.type === 'credit')
      .reduce((sum, t) => sum + (t.amount * t.quantity), 0);

    const netProfit = totalIncome - totalInvested;
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    return { totalInvested, totalIncome, netProfit, roi };
  }

  // Quick sell logic
  static async quickSell(itemId: string, sellPrice: number, quantity: number, sellDate: string) {
    // 1. Get the item
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) return;

    // 2. Create sell transaction
    const purchaseDateStr = new Date(item.purchase_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
    const sellTx = {
      product_name: `${item.product_name} (נרכש ב-${purchaseDateStr})`,
      type: 'sell',
      amount: sellPrice,
      quantity: quantity,
      date: sellDate,
      inventory_id: itemId,
      profit_amount: (sellPrice - item.purchase_price) * quantity,
      is_investment: item.is_investment || false
    };

    const { error: txError } = await supabase.from('transactions').insert([sellTx]);
    if (txError) throw txError;

    // 3. Update inventory status
    const newQuantity = item.quantity - quantity;
    const newStatus = newQuantity <= 0 ? 'sold' : 'partial';

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity, status: newStatus })
      .eq('id', itemId);

    if (updateError) throw updateError;
  }

  // Delete transaction
  static async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Update transaction
  static async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
    return data;
  }
}

export default DataManager;
