'use client';

import React from 'react';
import { PortfolioStats } from '../types/database';
import { TrendingUp, Wallet, TrendingDown, Activity } from 'lucide-react';

interface Props {
  stats: PortfolioStats;
}

const StatsCards: React.FC<Props> = ({ stats }) => {
  const cards = [
    {
      title: 'השקעה כוללת',
      value: `₪${stats.totalInvested.toLocaleString()}`,
      icon: <Wallet size={24} />,
      color: '#ffffff',
      label: 'TOTAL DEPOSITED'
    },
    {
      title: 'רווח נקי',
      value: `₪${stats.netProfit.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: stats.netProfit >= 0 ? 'var(--success)' : 'var(--danger)',
      label: 'NET EARNINGS'
    },
    {
      title: 'תשואה (ROI)',
      value: `${stats.roi.toFixed(1)}%`,
      icon: <Activity size={24} />,
      color: 'var(--accent-gold)',
      label: 'PORTFOLIO YIELD'
    },
    {
      title: 'יתרת מזומן',
      value: `₪${stats.totalIncome.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: '#ffffff',
      label: 'CASH ON HAND'
    }
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
