'use client';

import React from 'react';
import { Transaction } from '../types/database';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  transactions: Transaction[];
}

const AnalyticsChart: React.FC<Props> = ({ transactions }) => {
  // Process monthly data
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  const categories: { [key: string]: number } = { buy: 0, scratch: 0, collection: 0, other: 0 };

  transactions.forEach(tx => {
    // Monthly aggregation
    const month = new Date(tx.date).toLocaleString('he-IL', { month: 'short', year: '2-digit' });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    
    if (tx.type === 'buy' || tx.type === 'scratch' || tx.type === 'collection') {
      monthlyData[month].expense += tx.amount * tx.quantity;
      if (categories[tx.type] !== undefined) {
        categories[tx.type] += tx.amount * tx.quantity;
      }
    } else if (tx.type === 'sell' || tx.type === 'credit') {
      monthlyData[month].income += tx.amount * tx.quantity;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const dateA = new Date(a.split(' ')[0]);
    const dateB = new Date(b.split(' ')[0]);
    return dateA.getTime() - dateB.getTime();
  });

  const barData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'הכנסות',
        data: sortedMonths.map(m => monthlyData[m].income),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'הוצאות',
        data: sortedMonths.map(m => monthlyData[m].expense),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const doughnutData = {
    labels: ['השקעות (Buy)', 'גירודים (Scratch)', 'אוסף אישי'],
    datasets: [
      {
        data: [categories.buy, categories.scratch, categories.collection],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)'
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Outfit' },
        padding: 12,
        cornerRadius: 10,
        displayColors: true
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px', height: '400px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          תזרים מזומנים חודשי
        </h3>
        <div style={{ height: '300px' }}>
          <Bar data={barData} options={options} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', height: '400px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
          התפלגות הוצאות לפי קטגוריה
        </h3>
        <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
          <Doughnut 
            data={doughnutData} 
            options={{
              ...options,
              cutout: '70%',
              plugins: {
                ...options.plugins,
                legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20 } }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
