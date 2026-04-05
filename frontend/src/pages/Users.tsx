import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, UserX, Shield, Activity } from 'lucide-react';

const Users: React.FC = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Viewer');

  const fetchUsers = async () => {
    try {
      const data = await apiCall('/users', 'GET', undefined, token);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/users', 'POST', { email, password, role }, token);
      setShowModal(false);
      setEmail('');
      setPassword('');
      setRole('Viewer');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await apiCall(`/users/${id}`, 'PATCH', { status: newStatus }, token);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRole = async (id: number, currentRole: string) => {
    const roles = ['Admin', 'Analyst', 'Viewer'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    try {
      await apiCall(`/users/${id}`, 'PATCH', { role: nextRole }, token);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                <td style={{ fontWeight: 500 }}>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.status === 'Active' ? 'badge-income' : 'badge-expense'}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  {user?.id !== u.id && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.6rem' }} 
                        onClick={() => handleUpdateRole(u.id, u.role)}
                        title="Toggle Role"
                      >
                        <Shield size={14} />
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.6rem' }} 
                        onClick={() => handleUpdateStatus(u.id, u.status)}
                        title="Toggle Status"
                      >
                        <Activity size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>New User</h2>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="text" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Viewer" style={{ background: 'var(--bg-secondary)' }}>Viewer</option>
                  <option value="Analyst" style={{ background: 'var(--bg-secondary)' }}>Analyst</option>
                  <option value="Admin" style={{ background: 'var(--bg-secondary)' }}>Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
