import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatters';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ totalBookings: 0, completedBookings: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      const u = res.data.data.user;
      setProfileData(u);
      setStats(res.data.data.stats || {});
      setFormData({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        address: u.address || '',
      });
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setSavingProfile(true);
      const res = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      setProfileSuccess('Profile details updated successfully');
      updateUser({
        name: res.data.data.name,
        phone: res.data.data.phone,
        address: res.data.data.address,
      });
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    try {
      setChangingPass(true);
      await api.put('/users/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      setPassSuccess('Password changed successfully');
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading account profile..." fullPage />;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '1rem auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Account Profile & Security</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your personal details, contact preferences, and account credentials.
        </p>
      </div>

      {/* Account Highlights Banner */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
          padding: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IDENTITY STATUS</span>
          <div style={{ marginTop: '0.35rem' }}>
            <StatusBadge status={profileData?.verificationStatus || 'pending'} />
          </div>
          <div style={{ marginTop: '0.35rem' }}>
            <Link to="/verification" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
              Manage documents →
            </Link>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL RESERVATIONS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            {stats.totalBookings || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stats.completedBookings || 0} trips completed
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LIFETIME SPEND</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-success-text)' }}>
            {formatCurrency(stats.totalSpent || 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Verified transactions
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEMBER SINCE</span>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.35rem' }}>
            {formatDate(profileData?.createdAt)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Role: {profileData?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Forms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Personal Details Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Personal Information</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Ensure your full legal name and phone match your driver's license.
          </p>

          <ErrorMessage message={profileError} onClose={() => setProfileError('')} />

          {profileSuccess && (
            <div style={{ padding: '0.75rem', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              ✓ {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormInput
              label="Email Address (Login ID)"
              name="email"
              value={formData.email}
              disabled
            />

            <FormInput
              label="Contact Phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <FormInput
              label="Residential Address"
              name="address"
              as="textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="City, State, PIN code..."
              rows={3}
            />

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary btn-full"
              style={{ marginTop: '0.5rem' }}
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Security & Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Update your account password regularly to keep your rental profile secure.
          </p>

          <ErrorMessage message={passError} onClose={() => setPassError('')} />

          {passSuccess && (
            <div style={{ padding: '0.75rem', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              ✓ {passSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <FormInput
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              required
            />

            <FormInput
              label="New Password"
              name="newPassword"
              type="password"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              placeholder="At least 6 characters"
              required
            />

            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              placeholder="Repeat new password"
              required
            />

            <button
              type="submit"
              disabled={changingPass}
              className="btn btn-secondary btn-full"
              style={{ marginTop: '0.5rem' }}
            >
              {changingPass ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
