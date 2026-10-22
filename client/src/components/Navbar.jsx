import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CarIcon, UserIcon } from './Icons';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="brand-icon-box" aria-label="SmartFleet Car Icon">
            <CarIcon size={22} color="#042F2E" strokeWidth={2.4} />
          </div>
          <span className="brand-title">
            Smart<span className="brand-accent">Fleet</span>
          </span>
          {isAdmin ? (
            <span className="brand-badge admin-badge">ADMIN CONSOLE</span>
          ) : (
            <span className="fleet-live-pill">
              <span className="pulse-dot"></span> 50+ LIVE
            </span>
          )}
        </Link>

        {/* Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          {isAuthenticated ? (
            <ul className="nav-links">
              {isAdmin ? (
                <>
                  <li><NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                  <li><NavLink to="/admin/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Bookings</NavLink></li>
                  <li><NavLink to="/admin/vehicles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Vehicles</NavLink></li>
                  <li><NavLink to="/admin/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Customers</NavLink></li>
                  <li><NavLink to="/admin/maintenance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Maintenance</NavLink></li>
                  <li><NavLink to="/admin/verification" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Verification</NavLink></li>
                  <li><NavLink to="/admin/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Analytics</NavLink></li>
                </>
              ) : (
                <>
                  <li><NavLink to="/vehicles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Fleet Catalog</NavLink></li>
                  <li><NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Rentals</NavLink></li>
                  <li><NavLink to="/verification" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>KYC Verification</NavLink></li>
                  <li><NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Profile</NavLink></li>
                </>
              )}

              <li className="nav-user">
                <div className="nav-user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user?.name}</span>
                  <span className="nav-user-role">{user?.role === 'admin' ? 'Administrator' : 'Verified Driver'}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm nav-logout-btn">
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="nav-links">
              <li><NavLink to="/vehicles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Explore Fleet</NavLink></li>
              <li>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm btn-shimmer">
                  Create Account →
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="nav-menu-mobile">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-card">
                  <div className="nav-user-avatar large">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email} • {user?.role}</div>
                  </div>
                </div>

                {isAdmin ? (
                  <>
                    <NavLink to="/admin" end className="nav-link" onClick={closeMenu}>Admin Dashboard</NavLink>
                    <NavLink to="/admin/bookings" className="nav-link" onClick={closeMenu}>Manage Bookings</NavLink>
                    <NavLink to="/admin/vehicles" className="nav-link" onClick={closeMenu}>Fleet Inventory</NavLink>
                    <NavLink to="/admin/customers" className="nav-link" onClick={closeMenu}>Customers Directory</NavLink>
                    <NavLink to="/admin/maintenance" className="nav-link" onClick={closeMenu}>Maintenance Logs</NavLink>
                    <NavLink to="/admin/verification" className="nav-link" onClick={closeMenu}>KYC Approval Queue</NavLink>
                    <NavLink to="/admin/analytics" className="nav-link" onClick={closeMenu}>Fleet Analytics</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/vehicles" className="nav-link" onClick={closeMenu}>Browse All Vehicles</NavLink>
                    <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>My Bookings & Trips</NavLink>
                    <NavLink to="/verification" className="nav-link" onClick={closeMenu}>Account Verification</NavLink>
                    <NavLink to="/profile" className="nav-link" onClick={closeMenu}>My Profile & Security</NavLink>
                  </>
                )}

                <button
                  onClick={() => { closeMenu(); handleLogout(); }}
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/vehicles" className="nav-link" onClick={closeMenu}>Browse Fleet Catalog</NavLink>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMenu}>Sign In to Account</Link>
                <Link to="/register" className="btn btn-primary btn-sm btn-shimmer" onClick={closeMenu}>Create New Account</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
