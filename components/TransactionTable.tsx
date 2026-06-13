'use client';

import React, { useState } from 'react';
import { Transaction } from '../types/database';
import { Trash2, Edit2, ArrowUpRight, ArrowDownLeft, Gift, Zap, Heart, Calendar, Search, Filter } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

const TransactionTable: React.FC<Props> = ({ transactions, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all',        label: 'הכל',     color: '#94a3b8' },
    { id: 'buy',        label: 'קניות',   color: '#e11d48' },
    { id: 'sell',       label: 'מכירות',  color: '#10b981' },
    { id: 'scratch',    label: 'גירודים', color: '#e11d48' },
    { id: 'credit',     label: 'זיכויים', color: '#10b981' },
    { id: 'collection', label: 'אוסף',    color: '#8b5cf6' },
  ];

  return (
    <div className="glass-card animate-in" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Table Header & Toolbar */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} className="text-blue-400" /> היסטוריית פעולות
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '99px' }}>
            {filteredTransactions.length} פעולות נמצאו
          </span>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="חיפוש לפי שם מוצר..." 
              className="form-input" 
              style={{ paddingRight: '40px', marginBottom: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilterType(opt.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  background: filterType === opt.id ? `${opt.color}20` : 'rgba(255,255,255,0.02)',
                  borderColor: filterType === opt.id ? opt.color : 'var(--border-color)',
                  color: filterType === opt.id ? 'white' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>תאריך</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>סוג</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>מוצר</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>כמות</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>מחיר יחידה</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>סה"כ תנועה</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  לא נמצאו פעולות התואמות לחיפוש
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection';
                const isIncome = tx.type === 'sell' || tx.type === 'credit';
                return (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.2s',
                    background: isExpense
                      ? 'rgba(225, 29, 72, 0.03)'
                      : isIncome
                      ? 'rgba(16, 185, 129, 0.03)'
                      : 'transparent'
                  }}
                  className="hover-row"
                >
                  <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                  <td style={{ padding: '20px' }}>
                    <TypeBadge type={tx.type} />
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {tx.product_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '20px', fontWeight: 500 }}>{tx.quantity}</td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>₪{tx.amount.toLocaleString()}</span>
                      {tx.profit_amount !== undefined && tx.profit_amount !== null && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          עלות: ₪{(tx.amount - (tx.profit_amount / tx.quantity)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: isExpense ? 'var(--danger)' : 'var(--success)'
                      }}>
                        {isExpense ? '-' : '+'}₪{(tx.amount * tx.quantity).toLocaleString()}
                      </span>
                      {tx.profit_amount !== undefined && tx.profit_amount !== null && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: tx.profit_amount >= 0 ? 'var(--success)' : 'var(--danger)',
                          fontWeight: 700,
                          background: tx.profit_amount >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginTop: '4px'
                        }}>
                          {tx.profit_amount >= 0 ? '+' : ''}₪{tx.profit_amount.toLocaleString()} רווח
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => onEdit(tx)} className="btn-icon" title="עריכה"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(tx.id)} className="btn-icon text-danger" title="מחיקה"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .btn-icon {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .text-danger:hover {
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </div>
  );
};

const TypeBadge = ({ type }: { type: string }) => {
  const config: any = {
    buy:        { label: 'קנייה',      color: '#e11d48', icon: <ArrowDownLeft size={12} /> },
    sell:       { label: 'מכירה',      color: '#10b981', icon: <ArrowUpRight  size={12} /> },
    scratch:    { label: 'גירוד',      color: '#e11d48', icon: <Zap           size={12} /> },
    credit:     { label: 'זיכוי',      color: '#10b981', icon: <Gift          size={12} /> },
    collection: { label: 'אוסף אישי', color: '#8b5cf6', icon: <Heart         size={12} /> },
  };

  const item = config[type] || { label: type, color: '#94a3b8', icon: null };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '8px',
      fontSize: '0.7rem',
      fontWeight: '700',
      background: `${item.color}15`,
      color: item.color,
      border: `1px solid ${item.color}30`,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {item.icon} {item.label}
    </span>
  );
};

export default TransactionTable;
