'use client';

import React, { useState } from 'react';
import { InventoryItem } from '../types/database';
import { DollarSign, Tag, Calendar, X, Hash, Package, TrendingUp } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
  onQuickSell: (itemId: string, sellPrice: number, quantity: number, sellDate: string) => void;
}

const InventoryTab: React.FC<Props> = ({ inventory, onQuickSell }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }} className="animate-in">
      {inventory.length === 0 && (
        <div className="glass-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center' }}>
          <Package size={48} className="text-slate-600" style={{ marginBottom: '15px', opacity: 0.3 }} />
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>אין פריטים במלאי הפעיל כרגע</h3>
        </div>
      )}
      
      {inventory.map((item) => (
        <div key={item.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Package className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{item.product_name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>מזהה: {item.id.split('-')[0]}</span>
                </div>
              </div>
              <span style={{ 
                background: 'var(--bg-dark)', 
                color: 'var(--text-primary)', 
                padding: '6px 12px', 
                borderRadius: '10px', 
                fontSize: '0.85rem',
                fontWeight: 800,
                border: '1px solid var(--border-color)'
              }}>
                x{item.quantity}
              </span>
            </div>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', marginTop: '10px' }}>
              נקנה ב: ₪{item.purchase_price.toLocaleString()} | {new Date(item.purchase_date).toLocaleDateString('he-IL')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span className="stat-label" style={{ fontSize: '0.7rem' }}>מחיר קנייה</span>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₪{item.purchase_price.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span className="stat-label" style={{ fontSize: '0.7rem' }}>תאריך קנייה</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{new Date(item.purchase_date).toLocaleDateString('he-IL')}</div>
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
              style={{ width: '100%' }}
            >
              <TrendingUp size={18} /> מימוש ומכירה
            </button>
          </div>
        </div>
      ))}

      {/* Sell Modal */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card animate-in" style={{ padding: '32px', width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedItem(null)} 
              style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <DollarSign className="text-success" size={28} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>מכירת מוצר</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedItem.product_name}</p>
            </div>
            
            <form onSubmit={handleSellSubmit}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
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
              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <Calendar size={18} style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="date" required className="form-input" style={{ paddingRight: '40px', marginBottom: 0 }}
                  value={sellDate}
                  onChange={e => setSellDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
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
