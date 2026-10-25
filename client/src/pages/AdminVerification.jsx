import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { formatDate } from '../utils/formatters';

const AdminVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/verification');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verification list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      setUpdatingId(userId);
      setError('');
      setSuccessMessage('');

      await api.put(`/admin/verification/${userId}`, { status: newStatus });

      setSuccessMessage(`User verification status set to ${newStatus}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, verificationStatus: newStatus } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter && u.verificationStatus !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const nameMatch = u.name?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        const phoneMatch = u.phone?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [users, statusFilter, searchTerm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Identity Verification Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Review customer identity proofs and validate driving authorization credentials.
          </p>
        </div>

        <button onClick={fetchVerifications} className="btn btn-secondary btn-sm" disabled={loading}>
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

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Customer</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Verification State</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Accounts ({users.length})</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading customer verification queue..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="No Verification Records"
          description="There are currently no customer accounts matching your selection."
          actionLabel="Reset Filters"
          onAction={() => { setSearchTerm(''); setStatusFilter(''); }}
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Details</th>
                <th>Registered Date</th>
                <th>Driving License</th>
                <th>Government ID Proof</th>
                <th>Status</th>
                <th>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UID: {u._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    {u.drivingLicense ? (
                      <button
                        onClick={() => {
                          const docUrl = typeof u.drivingLicense === 'object' ? (u.drivingLicense?.documentUrl || '') : u.drivingLicense;
                          setPreviewDoc({ title: `${u.name} - Driving License`, url: docUrl });
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        👁️ View License
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not uploaded</span>
                    )}
                  </td>
                  <td>
                    {u.idProof ? (
                      <button
                        onClick={() => {
                          const docUrl = typeof u.idProof === 'object' ? (u.idProof?.documentUrl || '') : u.idProof;
                          setPreviewDoc({ title: `${u.name} - ID Proof`, url: docUrl });
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        👁️ View ID
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not uploaded</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={u.verificationStatus || 'pending'} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(u._id, 'approved')}
                        disabled={updatingId === u._id || u.verificationStatus === 'approved'}
                        className="btn btn-success btn-sm"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(u._id, 'rejected')}
                        disabled={updatingId === u._id || u.verificationStatus === 'rejected'}
                        className="btn btn-danger btn-sm"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Inspection'}
        maxWidth="750px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          {previewDoc?.url.includes('application/pdf') || previewDoc?.url.endsWith('.pdf') ? (
            <div style={{ padding: '2rem 1rem' }}>
              <p style={{ marginBottom: '1rem' }}>PDF document uploaded by customer.</p>
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open PDF Document in New Tab ↗
              </a>
            </div>
          ) : (
            <img
              src={previewDoc?.url}
              alt="Customer credential"
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                margin: '0 auto',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                objectFit: 'contain',
              }}
            />
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setPreviewDoc(null)} className="btn btn-secondary">
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVerification;
