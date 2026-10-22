import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 240, 232, 0.9) 60%, rgba(234, 228, 218, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184, 149, 104, 0.35)',
          boxShadow: '0 15px 35px rgba(41, 37, 36, 0.08), inset 0 1px 2px #ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: '#0D9488', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Customer Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-main)', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
            Welcome back, {user?.name || 'Customer'}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your vehicle reservations, track trip schedules, and review account security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/vehicles" className="btn btn-primary">
            🚗 Browse Vehicles
          </Link>
          <Link to="/verification" className="btn btn-secondary">
            📋 Verification Status
          </Link>
        </div>
      </div>

      {/* Verification Notice */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: user?.verificationStatus === 'approved' ? 'var(--status-success-bg)' : 'var(--surface)',
          borderColor: user?.verificationStatus === 'approved' ? 'var(--status-success-border)' : 'var(--surface-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '1.75rem' }}>
            {user?.verificationStatus === 'approved' ? '✅' : '🛡️'}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Identity Verification Status:</span>
              <StatusBadge status={user?.verificationStatus || 'pending'} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {user?.verificationStatus === 'approved'
                ? 'Your driving license and identity documents are fully verified.'
                : 'Upload your driving license and government ID to accelerate booking handovers.'}
            </p>
          </div>
        </div>

        {user?.verificationStatus !== 'approved' && (
          <Link to="/verification" className="btn btn-outline btn-sm">
            Upload Documents →
          </Link>
        )}
      </div>

      {/* Bookings Section */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>My Reservations</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Review your rental schedule and payment statuses
          </p>
        </div>

        <button onClick={fetchBookings} className="btn btn-secondary btn-sm" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Loading your bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="🚗"
          title="No Bookings Found"
          description="You haven't reserved any vehicles yet. Explore our premium fleet to plan your next journey."
          actionLabel="Browse Available Fleet"
          actionLink="/vehicles"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onBookingUpdated={fetchBookings} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
