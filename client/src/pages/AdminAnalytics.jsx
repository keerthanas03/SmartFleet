import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatters';

const PIE_COLORS = ['#0D9488', '#06B6D4', '#14B8A6', '#0F766E', '#115E59', '#F59E0B'];

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/analytics');
      setAnalyticsData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fleet analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating fleet analytics & intelligence..." fullPage />;
  }

  const {
    summary = {},
    monthlyRevenue = [],
    bookingStatusDistribution = [],
    vehicleStatusDistribution = [],
    topVehicles = [],
  } = analyticsData || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PERFORMANCE METRICS & INTELLIGENCE
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Fleet Analytics & Insights</h1>
        </div>

        <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm">
          🔄 Refresh Aggregations
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <StatCard
          title="Total Net Revenue"
          value={formatCurrency(summary.totalRevenue || 0)}
          icon="📈"
          subtitle="Realized transaction total"
          color="#10b981"
        />

        <StatCard
          title="Total Reservations"
          value={summary.totalBookings || 0}
          icon="📑"
          subtitle="All recorded trip bookings"
          color="#3b82f6"
        />

        <StatCard
          title="Active Customer Base"
          value={summary.totalCustomers || 0}
          icon="👥"
          subtitle="Registered consumer accounts"
          color="#8b5cf6"
        />

        <StatCard
          title="Fleet Size"
          value={summary.totalVehicles || 0}
          icon="🚗"
          subtitle="Total commercial fleet inventory"
          color="#0D9488"
        />

        <StatCard
          title="Total Service Cost"
          value={formatCurrency(summary.totalMaintenanceCost || 0)}
          icon="🔧"
          subtitle="Fleet maintenance expenditure"
          color="#ef4444"
        />
      </div>

      {/* Revenue Over Time Chart */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Revenue Over Time</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Historical gross revenue grouped by monthly billing cycles
          </p>
        </div>

        {monthlyRevenue.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
            No revenue recorded yet. Paid bookings will automatically populate this chart.
          </p>
        ) : (
          <div style={{ width: '100%', height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ADEAE8" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Booking Distribution & Fleet Status Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Booking Status Distribution */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Booking Status Breakdown</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Distribution of reservations across lifecycle stages
          </p>

          {bookingStatusDistribution.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
              No bookings to analyze.
            </p>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={4}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {bookingStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Fleet Status Distribution */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Fleet Allocation Overview</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Current vehicle deployment across operational states
          </p>

          {vehicleStatusDistribution.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
              No vehicle status data available.
            </p>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleStatusDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="status" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Fleet Vehicles */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Top Revenue-Generating Vehicles</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Vehicles with the highest rental demand and earnings
        </p>

        {topVehicles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No vehicle rental trends available yet.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Registration</th>
                  <th>Total Reservations</th>
                  <th>Total Earned Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topVehicles.map((v) => (
                  <tr key={v._id}>
                    <td style={{ fontWeight: 600 }}>{v.brand} {v.model}</td>
                    <td>{v.registrationNumber}</td>
                    <td style={{ fontWeight: 700 }}>{v.totalBookings} trips</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(v.totalRevenue)}
                    </td>
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

export default AdminAnalytics;
