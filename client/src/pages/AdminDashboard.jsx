import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time fleet analytics..." fullPage />;
  }

  const { vehicles = {}, bookings = {}, customers = {}, financials = {}, recentBookings = [] } = stats || {};

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OPERATIONS CONTROL
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Fleet Command Center</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm">
            🔄 Refresh Metrics
          </button>
          <Link to="/admin/vehicles" className="btn btn-primary btn-sm">
            + Add Vehicle
          </Link>
          <Link to="/admin/maintenance" className="btn btn-outline btn-sm">
            🛠️ Log Service
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {/* Financial & Customer High-Level KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(financials.totalRevenue || 0)}
          icon="💰"
          subtitle="Realized from paid reservations"
          color="#10b981"
        />

        <StatCard
          title="Fleet Maintenance Cost"
          value={formatCurrency(financials.totalMaintenanceCost || 0)}
          icon="🔧"
          subtitle="Cumulative service expenses"
          color="#ef4444"
        />

        <StatCard
          title="Registered Customers"
          value={customers.total || 0}
          icon="👥"
          subtitle="Customer accounts in database"
          color="#3b82f6"
        />

        <StatCard
          title="Total Bookings"
          value={bookings.total || 0}
          icon="📑"
          subtitle={`${bookings.confirmed || 0} Confirmed / ${bookings.completed || 0} Completed`}
          color="#8b5cf6"
        />
      </div>

      {/* Fleet Breakdown & Booking Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Fleet Status Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Fleet Inventory Status</h3>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
              {vehicles.total || 0} Total Units
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-success-text)', fontWeight: 600 }}>AVAILABLE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{vehicles.available || 0}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-info-text)', fontWeight: 600 }}>RENTED / ACTIVE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{vehicles.rented || 0}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-warning-text)', fontWeight: 600 }}>BOOKED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{vehicles.booked || 0}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-danger-text)', fontWeight: 600 }}>IN MAINTENANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{vehicles.maintenance || 0}</div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/admin/vehicles" className="btn btn-secondary btn-sm btn-full">
              Manage Vehicle Fleet →
            </Link>
          </div>
        </div>

        {/* Booking Pipeline Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Booking Pipeline</h3>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>
              {bookings.total || 0} Total Bookings
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-warning-text)', fontWeight: 600 }}>PENDING</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bookings.pending || 0}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-success-text)', fontWeight: 600 }}>CONFIRMED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bookings.confirmed || 0}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-info-text)', fontWeight: 600 }}>COMPLETED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bookings.completed || 0}</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-danger-text)', fontWeight: 600 }}>CANCELLED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bookings.cancelled || 0}</div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/admin/bookings" className="btn btn-secondary btn-sm btn-full">
              Process All Bookings →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Rental Reservations</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Latest customer bookings requiring operational tracking
            </p>
          </div>
          <Link to="/admin/bookings" className="btn btn-outline btn-sm">
            View All ({bookings.total || 0})
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
            No bookings recorded yet in the database.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Pickup</th>
                  <th>Return</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      #{b._id.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer?.email}</div>
                    </td>
                    <td>
                      <div>{b.vehicle?.brand} {b.vehicle?.model}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.vehicle?.registrationNumber}</div>
                    </td>
                    <td>{formatDate(b.pickupDate)}</td>
                    <td>{formatDate(b.returnDate)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(b.totalAmount)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td><StatusBadge status={b.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
