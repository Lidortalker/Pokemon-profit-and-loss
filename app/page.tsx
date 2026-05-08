'use client';

import React, { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import TransactionTable from '../components/TransactionTable';
import InventoryTab from '../components/InventoryTab';
import AnalyticsChart from '../components/AnalyticsChart';
import DataManager from '../lib/dataManager';
import { Transaction, InventoryItem, PortfolioStats, TransactionType } from '../types/database';
import { Plus, LayoutDashboard, History, Package, Loader2, X, Target, Heart } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'history'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({ totalInvested: 0, totalIncome: 0, netProfit: 0, roi: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // New Transaction State
  const [newTx, setNewTx] = useState({
    product_name: '',
    type: 'buy' as TransactionType,
    amount: 0,
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    is_investment: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const txs = await DataManager.getTransactions();
      const inv = await DataManager.getInventory();
      setTransactions(txs);
      setInventory(inv);
      setStats(DataManager.calculateStats(txs));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await DataManager.addTransaction(newTx);
      if (newTx.is_investment && (newTx.type === 'buy' || newTx.type === 'scratch')) {
        await DataManager.addToInventory({
          product_name: newTx.product_name,
          purchase_price: newTx.amount,
          purchase_date: newTx.date,
          quantity: newTx.quantity,
          status: 'available'
        });
      }
      await loadData();
      setIsModalOpen(false);
      setNewTx({
        product_name: '',
        type: 'buy',
        amount: 0,
        quantity: 1,
        date: new Date().toISOString().split('T')[0],
        is_investment: true
      });
    } catch (error) {
      alert('שגיאה בשמירת הנתונים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    setIsLoading(true);
    
    try {
      const { id, created_at, ...updates } = editingTx;
      await DataManager.updateTransaction(id, updates);
      
      // Sync with Inventory
      const u = updates as any;
      const shouldBeInInventory = u.is_investment && u.type === 'buy';
      
      if (shouldBeInInventory) {
          // Ensure it's in inventory (if not already)
          const inv = await DataManager.getInventory();
          const exists = inv.find(i => i.product_name === u.product_name && i.purchase_date === u.date);
          if (!exists) {
            await DataManager.addToInventory({
              product_name: u.product_name,
              purchase_price: u.amount,
              purchase_date: u.date,
              quantity: u.quantity,
              status: 'available'
            });
          }
      } else {
          // Remove from inventory if it was there
          await DataManager.removeFromInventory(u.product_name, u.date);
      }
      
      await loadData();
      setIsEditModalOpen(false);
      setEditingTx(null);
    } catch (error) {
      alert('שגיאה בעדכון הנתונים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עסקה זו?')) return;
    setIsLoading(true);
    try {
      await DataManager.deleteTransaction(id);
      await loadData();
    } catch (error) {
      alert('שגיאה במחיקת העסקה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSell = async (itemId: string, sellPrice: number, quantity: number, sellDate: string) => {
    setIsLoading(true);
    try {
      await DataManager.quickSell(itemId, sellPrice, quantity, sellDate);
      await loadData();
    } catch (error) {
      alert('שגיאה בביצוע המכירה');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setIsEditModalOpen(true);
  };

  const TypeButton = ({ type, currentType, onClick, label, activeColor }: { type: TransactionType, currentType: TransactionType, onClick: (t: TransactionType) => void, label: string, activeColor: string }) => (
    <button
      type="button"
      onClick={() => onClick(type)}
      style={{
        flex: 1,
        padding: '10px 5px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: currentType === type ? activeColor : 'var(--border-color)',
        background: currentType === type ? activeColor : 'rgba(255,255,255,0.05)',
        color: currentType === type ? 'white' : 'var(--text-secondary)',
        fontWeight: currentType === type ? '700' : '400',
        transition: 'all 0.2s',
        cursor: 'pointer',
        fontSize: '0.85rem'
      }}
    >
      {label}
    </button>
  );

  return (
    <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 2000,
          background: 'var(--bg-card)', padding: '10px 20px', borderRadius: '99px',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem',
          border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)'
        }}>
          <Loader2 className="animate-spin" size={18} /> מעדכן נתונים...
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
            Poke<span style={{ color: 'var(--accent-blue)' }}>Profit</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>ניהול השקעות פוקימון - פרימיום</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> עסקה חדשה
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LayoutDashboard size={18} /> דאשבורד
        </button>
        <button 
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('inventory')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Package size={18} /> מלאי פעיל
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('history')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <History size={18} /> היסטוריה
        </button>
      </nav>

      {/* Main Content Area */}
      {activeTab === 'dashboard' && (
        <>
          <StatsCards stats={stats} />
          <div style={{ marginTop: '30px' }}>
            <AnalyticsChart transactions={transactions} />
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <InventoryTab inventory={inventory} onQuickSell={handleQuickSell} />
      )}

      {activeTab === 'history' && (
        <TransactionTable 
          transactions={transactions} 
          onDelete={handleDeleteTransaction} 
          onEdit={openEditModal} 
        />
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ marginBottom: '20px', fontWeight: 700 }}>הוספת עסקה חדשה</h2>
            <form onSubmit={handleAddTransaction}>
              <label className="stat-label">סוג עסקה</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <TypeButton type="buy" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="קנייה" activeColor="var(--danger)" />
                <TypeButton type="scratch" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="גירוד" activeColor="var(--danger)" />
                <TypeButton type="collection" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="אוסף אישי" activeColor="#8b5cf6" />
                <TypeButton type="sell" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="מכירה" activeColor="var(--success)" />
                <TypeButton type="credit" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="זיכוי" activeColor="var(--success)" />
              </div>

              {(newTx.type === 'buy' || newTx.type === 'scratch') && (
                <div 
                  onClick={() => setNewTx({...newTx, is_investment: !newTx.is_investment})}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    background: newTx.is_investment ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s',
                    borderColor: newTx.is_investment ? 'var(--accent-blue)' : 'var(--border-color)'
                  }}
                >
                  <Target size={20} color={newTx.is_investment ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
                  <span style={{ color: newTx.is_investment ? 'white' : 'var(--text-secondary)', fontWeight: newTx.is_investment ? '700' : '400' }}>
                    למטרת השקעה (יופיע במלאי הפעיל)
                  </span>
                </div>
              )}

              <label className="stat-label">שם המוצר</label>
              <input 
                type="text" required className="form-input" 
                value={newTx.product_name}
                onChange={e => setNewTx({...newTx, product_name: e.target.value})}
              />
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label className="stat-label">תאריך</label>
                  <input 
                    type="date" required className="form-input" 
                    value={newTx.date}
                    onChange={e => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="stat-label">כמות</label>
                  <input 
                    type="number" required className="form-input" 
                    value={newTx.quantity}
                    onChange={e => setNewTx({...newTx, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>

              <label className="stat-label">מחיר ליחידה</label>
              <input 
                type="number" required className="form-input" 
                value={newTx.amount}
                onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
              />

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1 }}>
                  {isLoading ? 'שומר...' : 'שמור עסקה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {isEditModalOpen && editingTx && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => { setIsEditModalOpen(false); setEditingTx(null); }} style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ marginBottom: '20px', fontWeight: 700 }}>עריכת עסקה</h2>
            <form onSubmit={handleUpdateTransaction}>
              <label className="stat-label">סוג עסקה</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <TypeButton type="buy" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="קנייה" activeColor="var(--danger)" />
                <TypeButton type="scratch" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="גירוד" activeColor="var(--danger)" />
                <TypeButton type="collection" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="אוסף אישי" activeColor="#8b5cf6" />
                <TypeButton type="sell" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="מכירה" activeColor="var(--success)" />
                <TypeButton type="credit" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="זיכוי" activeColor="var(--success)" />
              </div>

              {(editingTx.type === 'buy' || editingTx.type === 'scratch') && (
                <div 
                  onClick={() => setEditingTx({...editingTx, is_investment: !editingTx.is_investment})}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    background: editingTx.is_investment ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s',
                    borderColor: editingTx.is_investment ? 'var(--accent-blue)' : 'var(--border-color)'
                  }}
                >
                  <Target size={20} color={editingTx.is_investment ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
                  <span style={{ color: editingTx.is_investment ? 'white' : 'var(--text-secondary)', fontWeight: editingTx.is_investment ? '700' : '400' }}>
                    למטרת השקעה (יופיע במלאי הפעיל)
                  </span>
                </div>
              )}

              <label className="stat-label">שם המוצר</label>
              <input 
                type="text" required className="form-input" 
                value={editingTx.product_name}
                onChange={e => setEditingTx({...editingTx, product_name: e.target.value})}
              />
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label className="stat-label">תאריך</label>
                  <input 
                    type="date" required className="form-input" 
                    value={editingTx.date}
                    onChange={e => setEditingTx({...editingTx, date: e.target.value})}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="stat-label">כמות</label>
                  <input 
                    type="number" required className="form-input" 
                    value={editingTx.quantity}
                    onChange={e => setEditingTx({...editingTx, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>

              <label className="stat-label">מחיר ליחידה</label>
              <input 
                type="number" required className="form-input" 
                value={editingTx.amount}
                onChange={e => setEditingTx({...editingTx, amount: Number(e.target.value)})}
              />

              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ flex: 1 }}>
                  {isLoading ? 'מעדכן...' : 'עדכן עסקה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
