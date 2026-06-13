'use client';

import React from 'react';
import { PortfolioStats } from '../types/database';
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Props {
  stats: PortfolioStats;
}

const StatsCards: React.FC<Props> = ({ stats }) => {
  const cards = [
    {
      title: 'השקעה כוללת',
      value: `₪${stats.totalInvested.toLocaleString()}`,
      icon: <ArrowDownLeft size={24} />,
      color: 'var(--danger)',
      label: 'TOTAL INVESTED'
    },
    {
      title: 'סה"כ תקבולים',
      value: `₪${stats.totalIncome.toLocaleString()}`,
      icon: <ArrowUpRight size={24} />,
      color: 'var(--success)',
      label: 'TOTAL INCOME'
    },
    {
      title: 'רווח נקי',
      value: `${stats.netProfit >= 0 ? '+' : ''}₪${stats.netProfit.toLocaleString()}`,
      icon: stats.netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />,
      color: stats.netProfit >= 0 ? 'var(--success)' : 'var(--danger)',
      label: 'NET PROFIT'
    },
    {
      title: 'תשואה (ROI)',
      value: `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`,
      icon: <Activity size={24} />,
      color: stats.roi >= 0 ? 'var(--accent-gold)' : 'var(--danger)',
      label: 'PORTFOLIO YIELD'
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
      {cards.map((card, index) => (
        <div key={index} className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '24px', left: '24px', opacity: 0.2, color: card.color }}>
            {card.icon}
          </div>
          <div className="stat-label">{card.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>{card.title}</h3>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
          </div>
          <div style={{ 
            height: '2px', width: '40px', background: card.color, marginTop: '20px', borderRadius: '1px', opacity: 0.6 
          }}></div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
