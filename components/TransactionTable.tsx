'use client';

import React from 'react';
import { Transaction } from '../types/database';
import { Trash2, Edit2, ArrowUpRight, ArrowDownLeft, Gift, Zap, Heart, Calendar, Package } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

const TransactionTable: React.FC<Props> = ({ transactions, onDelete, onEdit }) => {
  return (
    <div className="glass-card animate-in" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={20} className="text-blue-400" /> היסטוריית פעולות
        </h2>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>תאריך</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>סוג</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>מוצר</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>כמות</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>מחיר יחידה</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>סה"כ תנועה</th>
              <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover-row">
                <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(tx.date).toLocaleDateString('he-IL')}</td>
                <td style={{ padding: '20px' }}>
                  <TypeBadge type={tx.type} />
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: '0.95rem',
                      color: (tx.type === 'sell' || tx.type === 'credit') ? 'var(--danger)' : 'var(--text-primary)'
                    }}>
                      {tx.product_name}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 400 }}>
                      {(tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection') ? 'רכישה חדשה' : 'מימוש השקעה'}
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
                      color: (tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection') ? 'var(--danger)' : 'var(--success)' 
                    }}>
                      {(tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection') ? '-' : '+'}₪{(tx.amount * tx.quantity).toLocaleString()}
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
            ))}
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
    buy: { label: 'קנייה', color: '#3b82f6', icon: <ArrowDownLeft size={12} /> },
    sell: { label: 'מכירה', color: '#10b981', icon: <ArrowUpRight size={12} /> },
    scratch: { label: 'גירוד', color: '#f59e0b', icon: <Zap size={12} /> },
    credit: { label: 'זיכוי', color: '#06b6d4', icon: <Gift size={12} /> },
    collection: { label: 'אוסף אישי', color: '#8b5cf6', icon: <Heart size={12} /> },
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
