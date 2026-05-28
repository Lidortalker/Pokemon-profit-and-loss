'use client';

import React, { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import TransactionTable from '../components/TransactionTable';
import InventoryTab from '../components/InventoryTab';
import AnalyticsChart from '../components/AnalyticsChart';
import DataManager from '../lib/dataManager';
import { supabase } from '../lib/supabase';
import { Transaction, InventoryItem, PortfolioStats, TransactionType } from '../types/database';
import { Plus, LayoutDashboard, History, Package, Loader2, X, Target, Heart, ChevronLeft, Bell, Settings, User } from 'lucide-react';

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
      let createdInventoryItem = null;
      if (newTx.is_investment && (newTx.type === 'buy' || newTx.type === 'scratch')) {
        createdInventoryItem = await DataManager.addToInventory({
          product_name: newTx.product_name,
          purchase_price: newTx.amount,
          purchase_date: newTx.date,
          quantity: newTx.quantity,
          status: 'available'
        });
      }

      const txToCreate = {
        ...newTx,
        inventory_id: createdInventoryItem ? createdInventoryItem.id : undefined
      };

      await DataManager.addTransaction(txToCreate);
      await loadData();
      setIsModalOpen(false);
      setNewTx({
        product_name: '', type: 'buy', amount: 0, quantity: 1,
        date: new Date().toISOString().split('T')[0], is_investment: true
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
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
      const u = updates as any;
      const shouldBeInInventory = u.is_investment && (u.type === 'buy' || u.type === 'scratch');
      let updatedInventoryId = u.inventory_id;

      if (shouldBeInInventory) {
        if (u.inventory_id) {
          // Update the existing inventory item using its ID!
          const { error: invErr } = await supabase
            .from('inventory')
            .update({
              product_name: u.product_name,
              purchase_price: u.amount,
              purchase_date: u.date,
              quantity: u.quantity
            })
            .eq('id', u.inventory_id);

          if (invErr) {
            console.error('Error updating inventory item:', invErr);
          }
        } else {
          // It is active investment but doesn't have inventory_id yet (fallback for older items)
          const createdInventoryItem = await DataManager.addToInventory({
            product_name: u.product_name,
            purchase_price: u.amount,
            purchase_date: u.date,
            quantity: u.quantity,
            status: 'available'
          });
          updatedInventoryId = createdInventoryItem.id;
          updates.inventory_id = createdInventoryItem.id;
        }
      } else {
        // If it shouldn't be in inventory but has an inventory_id, delete it
        if (u.inventory_id) {
          const { error: delErr } = await supabase
            .from('inventory')
            .delete()
            .eq('id', u.inventory_id);

          if (delErr) {
            console.error('Error deleting inventory item:', delErr);
          }
          updatedInventoryId = null;
          updates.inventory_id = null as any;
        }
      }

      await DataManager.updateTransaction(id, updates);
      await loadData();
      setIsEditModalOpen(false);
      setEditingTx(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('שגיאה בעדכון הנתונים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עסקה זו?')) return;
    setIsLoading(true);
    try {
      const tx = transactions.find(t => t.id === id);
      if (tx && tx.inventory_id) {
        const { error: delErr } = await supabase
          .from('inventory')
          .delete()
          .eq('id', tx.inventory_id);
        if (delErr) {
          console.error('Error deleting inventory item:', delErr);
        }
      }
      await DataManager.deleteTransaction(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('שגיאה במחיקת העסקה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInventoryItem = (itemId: string) => {
    // 1. Try to find transaction by inventory_id
    let tx = transactions.find(t => t.inventory_id === itemId);

    // 2. Fallback: find by name and date match for older entries
    if (!tx) {
      const item = inventory.find(i => i.id === itemId);
      if (item) {
        tx = transactions.find(t => t.product_name === item.product_name && t.date === item.purchase_date && (t.type === 'buy' || t.type === 'scratch'));
      }
    }

    if (tx) {
      setEditingTx(tx);
      setIsEditModalOpen(true);
    } else {
      alert('לא נמצאה עסקת רכישה תואמת לפריט זה במלאי. תוכל לערוך אותו דרך יומן העסקאות.');
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

  const TypeButton = ({ type, currentType, onClick, label, activeColor }: { type: TransactionType, currentType: TransactionType, onClick: (t: TransactionType) => void, label: string, activeColor: string }) => (
    <button
      type="button"
      onClick={() => onClick(type)}
      style={{
        flex: 1, padding: '12px 5px', borderRadius: '12px', border: '1px solid',
        borderColor: currentType === type ? activeColor : 'var(--border-color)',
        background: currentType === type ? activeColor : 'rgba(255,255,255,0.03)',
        color: currentType === type ? 'white' : 'var(--text-secondary)',
        fontWeight: '600', transition: 'all 0.2s', cursor: 'pointer', fontSize: '0.85rem'
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ padding: '0 10px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px' }}>
            Poke<span style={{ color: 'var(--accent-blue)' }}>Profit</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>COMMAND CENTER v2.0</p>
        </div>

        <nav style={{ flex: 1 }}>
          <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>מרכז בקרה</span>
          </div>
          <div className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Package size={20} />
            <span>ניהול מלאי</span>
          </div>
          <div className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} />
            <span>יומן עסקאות</span>
          </div>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div className="nav-link"><Settings size={20} /> <span>הגדרות</span></div>
          <div className="nav-link"><User size={20} /> <span>פרופיל משתמש</span></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {activeTab === 'dashboard' ? 'סקירה פיננסית' : activeTab === 'inventory' ? 'ניהול מלאי פעיל' : 'יומן עסקאות מלא'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ברוך הבא, לידור. הנה מצב הפורטפוליו שלך.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer', background: 'var(--bg-card)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Bell size={20} color="var(--text-secondary)" />
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-sidebar)' }}></div>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> עסקה חדשה
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="animate-in">
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <StatsCards stats={stats} />
              <div className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', fontWeight: 700, fontSize: '1.2rem' }}>ניתוח מגמות וביצועים</h3>
                <AnalyticsChart transactions={transactions} />
              </div>

              {/* Compact Recent Transactions */}
              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>עסקאות אחרונות</h3>
                  <button 
                    onClick={() => setActiveTab('history')} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    הצג יומן מלא <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
                
                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>אין עסקאות להצגה.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <th style={{ padding: '12px 10px', fontWeight: 600 }}>תאריך</th>
                          <th style={{ padding: '12px 10px', fontWeight: 600 }}>סוג</th>
                          <th style={{ padding: '12px 10px', fontWeight: 600 }}>מוצר</th>
                          <th style={{ padding: '12px 10px', fontWeight: 600 }}>כמות</th>
                          <th style={{ padding: '12px 10px', fontWeight: 600 }}>סה"כ תנועה</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 5).map((tx) => (
                          <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                            <td style={{ padding: '14px 10px', color: 'var(--text-secondary)' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                            <td style={{ padding: '14px 10px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                background: tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection' ? 'var(--danger)' : 'var(--success)'
                              }}>
                                {tx.type === 'buy' ? 'קנייה' : tx.type === 'sell' ? 'מכירה' : tx.type === 'scratch' ? 'גירוד' : tx.type === 'credit' ? 'זיכוי' : 'אוסף'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 10px', fontWeight: 600 }}>{tx.product_name}</td>
                            <td style={{ padding: '14px 10px' }}>{tx.quantity}</td>
                            <td style={{ padding: '14px 10px', fontWeight: 700, color: tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection' ? 'var(--danger)' : 'var(--success)' }}>
                              {tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection' ? '-' : '+'}₪{(tx.amount * tx.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryTab inventory={inventory} onQuickSell={handleQuickSell} onEdit={handleEditInventoryItem} />
          )}

          {activeTab === 'history' && (
            <TransactionTable transactions={transactions} onDelete={handleDeleteTransaction} onEdit={(tx) => { setEditingTx(tx); setIsEditModalOpen(true); }} />
          )}
        </div>
      </main>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000, background: 'var(--bg-card)', padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          <Loader2 className="animate-spin" size={20} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>מסתנכרן עם הענן...</span>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-in" style={{ padding: '40px', width: '100%', maxWidth: '540px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '25px', left: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><X size={20} /></button>
            <h2 style={{ marginBottom: '30px', fontWeight: 800, fontSize: '1.5rem' }}>הוספת עסקה חדשה</h2>
            <form onSubmit={handleAddTransaction}>
              <label className="stat-label">סיווג עסקה</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '25px' }}>
                <TypeButton type="buy" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="קנייה" activeColor="var(--danger)" />
                <TypeButton type="scratch" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="גירוד" activeColor="var(--danger)" />
                <TypeButton type="collection" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="אוסף" activeColor="var(--accent-indigo)" />
                <TypeButton type="sell" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="מכירה" activeColor="var(--success)" />
                <TypeButton type="credit" currentType={newTx.type} onClick={(t) => setNewTx({...newTx, type: t})} label="זיכוי" activeColor="var(--success)" />
              </div>

              {(newTx.type === 'buy' || newTx.type === 'scratch') && (
                <div 
                  onClick={() => setNewTx({...newTx, is_investment: !newTx.is_investment})}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '16px', borderRadius: '16px', border: '1px solid',
                    background: newTx.is_investment ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: newTx.is_investment ? 'var(--accent-blue)' : 'var(--border-color)',
                    cursor: 'pointer', marginBottom: '25px', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ background: newTx.is_investment ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px' }}>
                    <Target size={20} color={newTx.is_investment ? 'white' : 'var(--text-secondary)'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: newTx.is_investment ? 'white' : 'var(--text-secondary)' }}>השקעה פעילה</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>יופיע בניהול המלאי ובמעקב רווחים</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="stat-label">שם המוצר / פריט</label>
                  <input type="text" required className="form-input" value={newTx.product_name} onChange={e => setNewTx({...newTx, product_name: e.target.value})} placeholder="למשל: Booster Box..." />
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 2 }}>
                    <label className="stat-label">תאריך ביצוע</label>
                    <input type="date" required className="form-input" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="stat-label">כמות</label>
                    <input type="number" required className="form-input" value={newTx.quantity} onChange={e => setNewTx({...newTx, quantity: Number(e.target.value)})} min="1" />
                  </div>
                </div>

                <div>
                  <label className="stat-label">מחיר ליחידה (₪)</label>
                  <input type="number" required className="form-input" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} />
                </div>
              </div>

              {newTx.quantity > 1 && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>סה"כ לתנועה:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>₪{(newTx.amount * newTx.quantity).toLocaleString()}</span>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '18px' }}>
                {isLoading ? 'שומר עסקה...' : 'אשר והוסף לפורטפוליו'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal - Same style as Add Modal */}
      {isEditModalOpen && editingTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-in" style={{ padding: '40px', width: '100%', maxWidth: '540px', position: 'relative' }}>
            <button onClick={() => { setIsEditModalOpen(false); setEditingTx(null); }} style={{ position: 'absolute', top: '25px', left: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><X size={20} /></button>
            <h2 style={{ marginBottom: '30px', fontWeight: 800, fontSize: '1.5rem' }}>עריכת עסקה קיימת</h2>
            <form onSubmit={handleUpdateTransaction}>
              <label className="stat-label">סיווג עסקה</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '25px' }}>
                <TypeButton type="buy" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="קנייה" activeColor="var(--danger)" />
                <TypeButton type="scratch" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="גירוד" activeColor="var(--danger)" />
                <TypeButton type="collection" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="אוסף" activeColor="var(--accent-indigo)" />
                <TypeButton type="sell" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="מכירה" activeColor="var(--success)" />
                <TypeButton type="credit" currentType={editingTx.type} onClick={(t) => setEditingTx({...editingTx, type: t})} label="זיכוי" activeColor="var(--success)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="stat-label">שם המוצר</label>
                  <input type="text" required className="form-input" value={editingTx.product_name} onChange={e => setEditingTx({...editingTx, product_name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 2 }}>
                    <label className="stat-label">תאריך</label>
                    <input type="date" required className="form-input" value={editingTx.date} onChange={e => setEditingTx({...editingTx, date: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="stat-label">כמות</label>
                    <input type="number" required className="form-input" value={editingTx.quantity} onChange={e => setEditingTx({...editingTx, quantity: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="stat-label">מחיר ליחידה (₪)</label>
                  <input type="number" required className="form-input" value={editingTx.amount} onChange={e => setEditingTx({...editingTx, amount: Number(e.target.value)})} />
                </div>
              </div>

              {editingTx.quantity > 1 && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>סה"כ לתנועה:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>₪{(editingTx.amount * editingTx.quantity).toLocaleString()}</span>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '18px' }}>
                {isLoading ? 'מעדכן שינויים...' : 'שמור שינויים'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
