import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import { ShieldCheckIcon, LockIcon, CarIcon } from '../components/Icons';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your network or try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        {/* Top Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <CarIcon size={26} color="#0D9488" />
          </div>
          <h2 className="auth-title">Create SmartFleet Account</h2>
          <p className="auth-subtitle">
            Join thousands of executives & travelers enjoying transparent self-drive mobility.
          </p>
        </div>

        <div className="signup-perks-row">
          <span>✓ Instant Booking</span>
          <span>✓ Zero Security Deposit</span>
          <span>✓ Fast Digital KYC</span>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. rahul@company.com"
            required
          />

          <FormInput
            label="Mobile Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +91 98765 43210"
            required
          />

          <div className="password-dual-row">
            <FormInput
              label="Create Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
            />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg btn-shimmer"
            disabled={loading}
            style={{ marginTop: '0.75rem' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration →'}
          </button>
        </form>

        <div className="auth-security-note">
          <ShieldCheckIcon size={14} color="#10b981" />
          <span>Your personal identity data is stored with encrypted protection.</span>
        </div>

        <div className="auth-footer-link">
          Already have a SmartFleet account?{' '}
          <Link to="/login" className="auth-highlight-link">
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
