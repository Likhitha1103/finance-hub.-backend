import React, { useEffect, useState } from 'react';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Shield, Activity } from 'lucide-react';

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
