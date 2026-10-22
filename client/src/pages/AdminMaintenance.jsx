import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

const defaultMaintenanceForm = {
  vehicleId: '',
  serviceDate: formatDateForInput(new Date()),
  mileage: 0,
  serviceType: 'Routine Oil & Filter Service',
  cost: 4500,
  description: '',
  nextServiceDate: '',
  status: 'SCHEDULED',
};

const AdminMaintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formData, setFormData] = useState(defaultMaintenanceForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [maintRes, vehRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/vehicles'),
      ]);
      setMaintenanceRecords(maintRes.data.data || []);
      setVehicles(vehRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRecordId(null);
    setFormData({
      ...defaultMaintenanceForm,
      vehicleId: vehicles[0]?._id || '',
    });
    setIsModalOpen(true);
    setError('');
  };

  const openEditModal = (record) => {
    setEditingRecordId(record._id);
    setFormData({
      vehicleId: record.vehicle?._id || '',
      serviceDate: formatDateForInput(record.serviceDate),
      mileage: record.mileage || 0,
      serviceType: record.serviceType || '',
      cost: record.cost || 0,
      description: record.description || '',
      nextServiceDate: record.nextServiceDate ? formatDateForInput(record.nextServiceDate) : '',
      status: record.status || 'SCHEDULED',
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.vehicleId) {
      setError('Please select a fleet vehicle');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        mileage: Number(formData.mileage),
        cost: Number(formData.cost),
        nextServiceDate: formData.nextServiceDate ? new Date(formData.nextServiceDate) : undefined,
      };

      if (editingRecordId) {
        const res = await api.put(`/maintenance/${editingRecordId}`, payload);
        setSuccessMessage('Maintenance record updated successfully');
        setMaintenanceRecords((prev) =>
          prev.map((r) => (r._id === editingRecordId ? res.data.data : r))
        );
      } else {
        const res = await api.post('/maintenance', payload);
        setSuccessMessage('Maintenance service logged. Vehicle marked under MAINTENANCE.');
        setMaintenanceRecords((prev) => [res.data.data, ...prev]);
      }

      setIsModalOpen(false);
      // Re-fetch to synchronize vehicle statuses
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save maintenance log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (recordId, newStatus) => {
    try {
      setError('');
      const res = await api.put(`/maintenance/${recordId}`, { status: newStatus });
      setSuccessMessage(`Service marked as ${newStatus}`);
      setMaintenanceRecords((prev) =>
        prev.map((r) => (r._id === recordId ? res.data.data : r))
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this maintenance entry?')) return;

    try {
      await api.delete(`/maintenance/${recordId}`);
      setSuccessMessage('Maintenance log removed');
      setMaintenanceRecords((prev) => prev.filter((r) => r._id !== recordId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const brandMatch = r.vehicle?.brand?.toLowerCase().includes(q);
        const modelMatch = r.vehicle?.model?.toLowerCase().includes(q);
        const regMatch = r.vehicle?.registrationNumber?.toLowerCase().includes(q);
        const serviceMatch = r.serviceType?.toLowerCase().includes(q);
        if (!brandMatch && !modelMatch && !regMatch && !serviceMatch) return false;
      }
      return true;
    });
  }, [maintenanceRecords, statusFilter, searchTerm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Fleet Maintenance & Service</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Schedule inspections, monitor repair expenses, and manage vehicle readiness.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" disabled={loading}>
            🔄 Refresh
          </button>
          <button onClick={openAddModal} className="btn btn-primary btn-sm">
            + Log Maintenance
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

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Maintenance</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search vehicle, registration, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Status Filter</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses ({maintenanceRecords.length})</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading maintenance logs..." />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon="🛠️"
          title="No Maintenance Records Found"
          description="All fleet vehicles are currently serviced and operational."
          actionLabel="+ Log New Service"
          onAction={openAddModal}
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Details</th>
                <th>Registration</th>
                <th>Service Date</th>
                <th>Service Type</th>
                <th>Odometer</th>
                <th>Expense Cost</th>
                <th>Status</th>
                <th>Next Service</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.vehicle?.brand} {m.vehicle?.model}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.description || 'Routine upkeep'}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{m.vehicle?.registrationNumber || 'N/A'}</td>
                  <td>{formatDate(m.serviceDate)}</td>
                  <td>{m.serviceType}</td>
                  <td>{m.mileage?.toLocaleString()} km</td>
                  <td style={{ fontWeight: 700, color: 'var(--status-danger-text)' }}>
                    {formatCurrency(m.cost)}
                  </td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>{m.nextServiceDate ? formatDate(m.nextServiceDate) : 'Not scheduled'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {m.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleQuickStatusChange(m._id, 'COMPLETED')}
                          className="btn btn-success btn-sm"
                          title="Complete service and restore vehicle availability"
                        >
                          ✓ Done
                        </button>
                      )}
                      <button onClick={() => openEditModal(m)} className="btn btn-secondary btn-sm">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(m._id)} className="btn btn-danger btn-sm">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Logging / Editing Maintenance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecordId ? 'Edit Maintenance Service' : 'Schedule Fleet Maintenance'}
      >
        <form onSubmit={handleSubmit}>
          {!editingRecordId && (
            <div className="form-group">
              <label className="form-label">Select Vehicle *</label>
              <select
                name="vehicleId"
                className="form-select"
                value={formData.vehicleId}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Choose Fleet Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.brand} {v.model} ({v.registrationNumber}) - Status: {v.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Service Date"
              name="serviceDate"
              type="date"
              value={formData.serviceDate}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Vehicle Odometer (km)"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleInputChange}
              min={0}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Service Type"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleInputChange}
              placeholder="e.g. Brake Pads Replacement"
              required
            />
            <FormInput
              label="Maintenance Cost (₹)"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleInputChange}
              min={0}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Status"
              name="status"
              as="select"
              value={formData.status}
              onChange={handleInputChange}
              options={['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']}
              required
            />
            <FormInput
              label="Next Projected Service"
              name="nextServiceDate"
              type="date"
              value={formData.nextServiceDate}
              onChange={handleInputChange}
            />
          </div>

          <FormInput
            label="Service Notes & Description"
            name="description"
            as="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Document technicians notes, parts replaced, or warranty details..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Saving...' : editingRecordId ? 'Update Record' : 'Record Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMaintenance;
