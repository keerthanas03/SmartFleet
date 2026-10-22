import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import InvoiceModal from '../components/InvoiceModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BOOKING_STATUSES } from '../utils/constants';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Invoice modal state
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      setError('');
      setSuccessMessage('');

      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });

      setSuccessMessage(`Booking #${bookingId.slice(-6).toUpperCase()} updated to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.data.data : b))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const custMatch = b.customer?.name?.toLowerCase().includes(query) || b.customer?.email?.toLowerCase().includes(query);
        const vehMatch = b.vehicle?.brand?.toLowerCase().includes(query) || b.vehicle?.model?.toLowerCase().includes(query) || b.vehicle?.registrationNumber?.toLowerCase().includes(query);
        const idMatch = b._id?.toLowerCase().includes(query);
        if (!custMatch && !vehMatch && !idMatch) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, searchTerm]);

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      setError('');
      const res = await api.get('/admin/reports/export-bookings', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartFleet_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export booking report');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Reservation Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Approve, activate, complete, and track all fleet customer bookings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            disabled={exportLoading || loading || bookings.length === 0}
          >
            {exportLoading ? 'Exporting...' : '📥 Export CSV'}
          </button>
          <button onClick={fetchBookings} className="btn btn-secondary btn-sm" disabled={loading}>
            🔄 Refresh
          </button>
        </div>
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
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Bookings</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search customer, vehicle, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Filter Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses ({bookings.length})</option>
              {BOOKING_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading all fleet bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon="📑"
          title="No Bookings Match Query"
          description="There are no reservations matching your current search parameters."
          actionLabel="Reset Search"
          onAction={() => { setSearchTerm(''); setStatusFilter(''); }}
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Vehicle Details</th>
                <th>Rental Schedule</th>
                <th>Locations</th>
                <th>Total Fare</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Operational Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    #{b._id.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customer?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer?.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer?.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.vehicle?.brand} {b.vehicle?.model}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Reg: {b.vehicle?.registrationNumber || 'N/A'} • {b.vehicle?.category}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatDate(b.pickupDate)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to {formatDate(b.returnDate)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {b.numberOfDays} {b.numberOfDays === 1 ? 'Day' : 'Days'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div><strong>Out:</strong> {b.pickupLocation}</div>
                    <div><strong>In:</strong> {b.returnLocation}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                      {formatCurrency(b.totalAmount)}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td>
                    <StatusBadge status={b.paymentStatus} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(b._id, 'CONFIRMED')}
                            disabled={updatingId === b._id}
                            className="btn btn-success btn-sm"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(b._id, 'CANCELLED')}
                            disabled={updatingId === b._id}
                            className="btn btn-danger btn-sm"
                          >
                            ✕ Cancel
                          </button>
                        </>
                      )}

                      {b.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(b._id, 'ACTIVE')}
                            disabled={updatingId === b._id}
                            className="btn btn-primary btn-sm"
                          >
                            🔑 Handover (Active)
                          </button>
                          <button
                            onClick={() => handleStatusChange(b._id, 'CANCELLED')}
                            disabled={updatingId === b._id}
                            className="btn btn-secondary btn-sm"
                          >
                            ✕ Cancel
                          </button>
                        </>
                      )}

                      {b.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusChange(b._id, 'COMPLETED')}
                          disabled={updatingId === b._id}
                          className="btn btn-success btn-sm"
                        >
                          🏁 Complete Return
                        </button>
                      )}

                      {b.status === 'COMPLETED' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--status-success-text)', fontWeight: 600 }}>
                          Trip Finished
                        </span>
                      )}

                      {b.status === 'CANCELLED' && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--status-danger-text)', fontWeight: 600 }}>
                          Cancelled
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoiceBooking(b);
                          setIsInvoiceOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="View GST Tax Invoice"
                      >
                        📄 Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal for Admin Inspection */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedInvoiceBooking(null);
        }}
        booking={selectedInvoiceBooking}
      />
    </div>
  );
};

export default AdminBookings;
