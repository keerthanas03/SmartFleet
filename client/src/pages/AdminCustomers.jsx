import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customerId, currentSuspended) => {
    const action = currentSuspended ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this customer account?`)) {
      return;
    }

    try {
      setTogglingId(customerId);
      setError('');
      setSuccessMessage('');

      const res = await api.put(`/admin/customers/${customerId}/status`);
      setSuccessMessage(res.data.message);

      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId ? { ...c, isSuspended: res.data.isSuspended } : c))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (verificationFilter && c.verificationStatus !== verificationFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q);
        const phoneMatch = c.phone?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [customers, verificationFilter, searchTerm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Customer Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage registered customer accounts, lifetime rental volumes, and account access.
          </p>
        </div>

        <button onClick={fetchCustomers} className="btn btn-secondary btn-sm" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {successMessage && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            color: 'var(--status-success-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontWeight: 500,
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Customers</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Verification Filter</label>
            <select
              className="form-select"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="">All Verification States</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading customer directory..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Customers Match Query"
          description="There are no registered consumer accounts matching your query."
          actionLabel="Clear Filters"
          onAction={() => { setSearchTerm(''); setVerificationFilter(''); }}
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Details</th>
                <th>Verification</th>
                <th>Total Trips</th>
                <th>Completed Trips</th>
                <th>Lifetime Spend</th>
                <th>Joined</th>
                <th>Account Status</th>
                <th>Access Control</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UID: #{c._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td>
                    <div>{c.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                  </td>
                  <td>
                    <StatusBadge status={c.verificationStatus || 'pending'} />
                  </td>
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>
                    {c.metrics?.totalTrips || 0}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--status-success-text)', textAlign: 'center' }}>
                    {c.metrics?.completedTrips || 0}
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(c.metrics?.totalSpend || 0)}
                  </td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    {c.isSuspended ? (
                      <span className="badge badge-danger">Suspended</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(c._id, c.isSuspended)}
                      disabled={togglingId === c._id}
                      className={`btn btn-sm ${c.isSuspended ? 'btn-success' : 'btn-danger'}`}
                    >
                      {togglingId === c._id
                        ? 'Processing...'
                        : c.isSuspended
                        ? 'Reactivate'
                        : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
