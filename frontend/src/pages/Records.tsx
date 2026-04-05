import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

const Records: React.FC = () => {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchRecords = async () => {
    try {
      const data = await apiCall('/records', 'GET', undefined, token);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/records', 'POST', {
        amount: Number(amount),
        type,
        category,
        date,
        notes
      }, token);
      setShowModal(false);
      setAmount('');
      setCategory('');
      setNotes('');
      fetchRecords();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await apiCall(`/records/${id}`, 'DELETE', undefined, token);
      fetchRecords();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading records...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Financial Records</h1>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Record
          </button>
        )}
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Author</th>
              {user?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td>
                  <span className={`badge ${record.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                    {record.type}
                  </span>
                </td>
                <td>{record.category}</td>
                <td style={{ fontWeight: 600, color: record.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                  ${record.amount.toFixed(2)}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{record.notes || '-'}</td>
                <td>{record.created_by_email || 'Unknown'}</td>
                {user?.role === 'Admin' && (
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.4rem 0.6rem' }}
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>New Record</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="expense" style={{ background: 'var(--bg-secondary)' }}>Expense</option>
                    <option value="income" style={{ background: 'var(--bg-secondary)' }}>Income</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input type="number" step="0.01" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input type="text" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. Utilities" />
                </div>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Notes (Optional)</label>
                <input type="text" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
