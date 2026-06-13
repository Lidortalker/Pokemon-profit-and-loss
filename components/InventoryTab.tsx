'use client';

import React, { useState } from 'react';
import { InventoryItem } from '../types/database';
import { DollarSign, Tag, Calendar, X, Hash, Package, TrendingUp, Search, ArrowUpDown, ChevronDown, Edit2 } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  onQuickSell: (itemId: string, sellPrice: number, quantity: number, sellDate: string) => void;
  onEdit?: (itemId: string) => void;
}

const InventoryTab: React.FC<Props> = ({ inventory, onQuickSell, onEdit }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');

  const filteredInventory = inventory
    .filter(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
      if (sortBy === 'price') return b.purchase_price - a.purchase_price;
      if (sortBy === 'name') return a.product_name.localeCompare(b.product_name);
      return 0;
    });

  // Summary calculations
  const totalInvested = inventory.reduce((sum, item) => sum + item.purchase_price * item.quantity, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  // Days held helper
  const getDaysHeld = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getDaysColor = (days: number) => {
    if (days <= 30) return '#10b981';  // green — fresh
    if (days <= 90) return '#f59e0b';  // amber — medium
    return '#e11d48';                  // red   — holding long
  };

  // Profit preview in sell modal
  const profitPerUnit = selectedItem ? sellPrice - selectedItem.purchase_price : 0;
  const totalProfit = profitPerUnit * sellQuantity;

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      onQuickSell(selectedItem.id, sellPrice, sellQuantity, sellDate);
      setSelectedItem(null);
      setSellPrice(0);
      setSellQuantity(1);
    }
  };

  return (
    <div className="animate-in">
      {/* Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', borderRight: '3px solid var(--danger)' }}>
          <div className="stat-label">סה"כ מושקע במלאי</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '6px' }}>₪{totalInvested.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderRight: '3px solid var(--accent-blue)' }}>
          <div className="stat-label">פריטים שונים</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '6px' }}>{inventory.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderRight: '3px solid var(--accent-gold)' }}>
          <div className="stat-label">יחידות כוללות</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '6px' }}>{totalItems}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="חיפוש מוצר במלאי..." 
            className="form-input" 
            style={{ paddingRight: '40px', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>מיין לפי:</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setSortBy('date')}
              style={{ 
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                background: sortBy === 'date' ? 'var(--accent-blue)' : 'transparent',
                color: sortBy === 'date' ? 'white' : 'var(--text-secondary)'
              }}
            >תאריך</button>
            <button 
              onClick={() => setSortBy('price')}
              style={{ 
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                background: sortBy === 'price' ? 'var(--accent-blue)' : 'transparent',
                color: sortBy === 'price' ? 'white' : 'var(--text-secondary)'
              }}
            >מחיר</button>
            <button 
              onClick={() => setSortBy('name')}
              style={{ 
                padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                background: sortBy === 'name' ? 'var(--accent-blue)' : 'transparent',
                color: sortBy === 'name' ? 'white' : 'var(--text-secondary)'
              }}
            >שם</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredInventory.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center' }}>
            <Package size={48} className="text-slate-600" style={{ marginBottom: '15px', opacity: 0.3 }} />
            <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>לא נמצאו פריטים במלאי</h3>
          </div>
        )}
        
        {filteredInventory.map((item) => {
          const days = getDaysHeld(item.purchase_date);
          const daysColor = getDaysColor(days);
          return (
          <div key={item.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: `3px solid ${daysColor}` }}>
            <div style={{ padding: '24px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '14px' }}>
                    <Package className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'white' }}>{item.product_name}</h3>
                    <span style={{ fontSize: '0.72rem', color: daysColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      ● {days} ימים במלאי
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(item.id)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        padding: '8px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="ערוך מוצר"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
                    color: 'white', 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    x{item.quantity}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginTop: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="stat-label" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '4px' }}>מחיר רכישה</span>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'white' }}>
                    ₪{item.purchase_price.toLocaleString()}
                    {item.quantity > 1 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
                        סה"כ: ₪{(item.purchase_price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="stat-label" style={{ fontSize: '0.65rem', display: 'block', marginBottom: '4px' }}>תאריך רכישה</span>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{new Date(item.purchase_date).toLocaleDateString('he-IL')}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => { 
                  setSelectedItem(item); 
                  setSellPrice(item.purchase_price); 
                  setSellQuantity(item.quantity);
                }}
                style={{ width: '100%', gap: '10px' }}
              >
                <TrendingUp size={18} /> מימוש ומכירה
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Sell Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card animate-in" style={{ padding: '32px', width: '100%', maxWidth: '420px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setSelectedItem(null)} 
              style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'all 0.2s' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <DollarSign className="text-success" size={32} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>מכירת מוצר</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{selectedItem.product_name}</p>
            </div>
            
            <form onSubmit={handleSellSubmit}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 2 }}>
                  <label className="stat-label">מחיר מכירה ליחידה</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--text-secondary)' }} />
                    <input 
                      type="number" required className="form-input" style={{ paddingRight: '40px', marginBottom: 0 }}
                      value={sellPrice}
                      onChange={e => setSellPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="stat-label">כמות</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--text-secondary)' }} />
                    <input 
                      type="number" required className="form-input" style={{ paddingRight: '40px', marginBottom: 0 }}
                      min="1" max={selectedItem.quantity}
                      value={sellQuantity}
                      onChange={e => setSellQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <label className="stat-label">תאריך סגירת עסקה</label>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Calendar size={18} style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="date" required className="form-input" style={{ paddingRight: '40px', marginBottom: 0 }}
                  value={sellDate}
                  onChange={e => setSellDate(e.target.value)}
                />
              </div>

              {sellQuantity > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{
                    background: 'rgba(16,185,129,0.06)',
                    padding: '12px 16px', borderRadius: '12px',
                    border: '1px solid rgba(16,185,129,0.15)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>סה"כ תקבול:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>₪{(sellPrice * sellQuantity).toLocaleString()}</span>
                  </div>
                  <div style={{
                    background: totalProfit >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(225,29,72,0.06)',
                    padding: '12px 16px', borderRadius: '12px',
                    border: `1px solid ${totalProfit >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(225,29,72,0.2)'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>רווח/הפסד צפוי:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {totalProfit >= 0 ? '+' : ''}₪{totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.05rem', borderRadius: '14px' }}>
                אשר וסיים עסקה
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
