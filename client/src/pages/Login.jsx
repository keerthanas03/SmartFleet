import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import { LockIcon, ShieldCheckIcon, UserIcon, CarIcon } from '../components/Icons';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleQuickFillKeerthana = () => {
    setFormData({
      email: 'keerthanas2383@gmail.com',
      password: 'Admin@123456',
    });
    if (error) setError('');
  };

  const handleQuickFillAdmin = () => {
    setFormData({
      email: 'admin@smartfleet.com',
      password: 'Admin@123456',
    });
    if (error) setError('');
  };

  const handleQuickFillCustomer = () => {
    setFormData({
      email: 'customer@smartfleet.com',
      password: 'Customer@123456',
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide your email address and password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', formData);

      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);

        // Redirect based on role or previous attempted route
        const redirectPath = location.state?.from?.pathname || (res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials or database connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Top Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <CarIcon size={26} color="#0D9488" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your bookings, saved vehicles, and verification status.
          </p>
        </div>

        {/* Quick Sign-in Bar */}
        <div className="quick-fill-box">
          <div className="quick-fill-title">Quick Sign-in:</div>
          <div className="quick-fill-chips">
            <button
              type="button"
              className="quick-fill-btn customer-chip"
              onClick={handleQuickFillKeerthana}
              style={{
                borderColor: 'rgba(184, 149, 104, 0.45)',
                background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f0e8 100%)',
                color: '#292524',
                fontWeight: 600,
              }}
            >
              👤 Keerthana (Customer)
            </button>
            <button
              type="button"
              className="quick-fill-btn admin-chip"
              onClick={handleQuickFillAdmin}
            >
              👑 Fleet Administrator
            </button>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. admin@smartfleet.com"
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your account password"
            required
          />

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg btn-shimmer"
            disabled={loading}
            style={{ marginTop: '0.75rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to SmartFleet →'}
          </button>
        </form>

        <div className="auth-security-note">
          <LockIcon size={14} color="#10b981" />
          <span>256-Bit SSL Encrypted End-to-End Session</span>
        </div>

        <div className="auth-footer-link">
          Don't have an account yet?{' '}
          <Link to="/register" className="auth-highlight-link">
            Create Free Account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
