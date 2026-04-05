import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await apiCall('/dashboard/summary', 'GET', undefined, token);
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  if (loading) return <div>Loading dashboard...</div>;
  if (!summary) return <div>Failed to load summary</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Welcome back, {user?.email}. Here is your financial summary.
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Income</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${summary.totalIncome.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--danger)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Expense</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${summary.totalExpense.toFixed(2)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Net Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: summary.netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ${summary.netBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Activity */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Activity</h3>
          {summary.recentActivity.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No recent activity.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summary.recentActivity.map((record: any) => (
                <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{record.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.date}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: record.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {record.type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Category Breakdown</h3>
          {summary.categoryTotals.length === 0 ? (
           <div style={{ color: 'var(--text-muted)' }}>No data available.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summary.categoryTotals.map((cat: any, idx: number) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span>{cat.category}</span>
                    <span style={{ color: cat.type === 'income' ? 'var(--success)' : 'var(--text-secondary)' }}>${cat.total.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.min(100, (cat.total / Math.max(summary.totalIncome, summary.totalExpense)) * 100)}%`,
                      background: cat.type === 'income' ? 'var(--success)' : 'var(--accent-gradient)',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
