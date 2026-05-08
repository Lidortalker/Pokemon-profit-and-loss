'use client';

import React from 'react';
import { PortfolioStats } from '../types/database';
import { TrendingUp, Wallet, ArrowUpCircle, Percent } from 'lucide-react';

interface Props {
  stats: PortfolioStats;
}

const StatsCards: React.FC<Props> = ({ stats }) => {
  const cards = [
    {
      title: 'סה"כ מושקע',
      value: `₪${stats.totalInvested.toLocaleString()}`,
      icon: <Wallet className="text-blue-400" size={24} />,
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)',
      borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      title: 'הכנסות',
      value: `₪${stats.totalIncome.toLocaleString()}`,
      icon: <ArrowUpCircle className="text-emerald-400" size={24} />,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)',
      borderColor: 'rgba(16, 185, 129, 0.2)'
    },
    {
      title: 'רווח נקי',
      value: `₪${stats.netProfit.toLocaleString()}`,
      icon: <TrendingUp className="text-purple-400" size={24} />,
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent)',
      borderColor: 'rgba(139, 92, 246, 0.2)'
    },
    {
      title: 'תשואה (ROI)',
      value: `${stats.roi.toFixed(1)}%`,
      icon: <Percent className="text-amber-400" size={24} />,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent)',
      borderColor: 'rgba(245, 158, 11, 0.2)'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="glass-card" 
          style={{ 
            padding: '24px', 
            background: card.gradient,
            borderColor: card.borderColor,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">{card.title}</span>
            <div style={{ opacity: 0.8 }}>{card.icon}</div>
          </div>
          <div className="stat-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
