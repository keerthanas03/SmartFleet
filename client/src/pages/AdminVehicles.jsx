import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';
import {
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_STATUSES,
  POPULAR_LOCATIONS,
} from '../utils/constants';

const defaultVehicleForm = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'Sedan',
  registrationNumber: '',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  seatingCapacity: 5,
  pricePerDay: 3000,
  location: 'Mumbai Airport Terminal 2',
  images: '',
  features: '',
  status: 'AVAILABLE',
  mileage: 0,
  nextServiceDate: '',
};

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [formData, setFormData] = useState(defaultVehicleForm);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicleId(null);
    setFormData(defaultVehicleForm);
    setIsModalOpen(true);
    setError('');
  };

  const openEditModal = (vehicle) => {
    setEditingVehicleId(vehicle._id);
    setFormData({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      category: vehicle.category || 'Sedan',
      registrationNumber: vehicle.registrationNumber || '',
      fuelType: vehicle.fuelType || 'Petrol',
      transmission: vehicle.transmission || 'Automatic',
      seatingCapacity: vehicle.seatingCapacity || 5,
      pricePerDay: vehicle.pricePerDay || 0,
      location: vehicle.location || '',
      images: Array.isArray(vehicle.images) ? vehicle.images.join(', ') : vehicle.images || '',
      features: Array.isArray(vehicle.features) ? vehicle.features.join(', ') : vehicle.features || '',
      status: vehicle.status || 'AVAILABLE',
      mileage: vehicle.mileage || 0,
      nextServiceDate: vehicle.nextServiceDate ? formatDateForInput(vehicle.nextServiceDate) : '',
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

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        year: Number(formData.year),
        seatingCapacity: Number(formData.seatingCapacity),
        pricePerDay: Number(formData.pricePerDay),
        mileage: Number(formData.mileage),
        images: formData.images
          ? formData.images.split(',').map((img) => img.trim()).filter(Boolean)
          : [],
        features: formData.features
          ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
          : [],
        nextServiceDate: formData.nextServiceDate ? new Date(formData.nextServiceDate) : undefined,
      };

      if (editingVehicleId) {
        const res = await api.put(`/vehicles/${editingVehicleId}`, payload);
        setSuccessMessage(`Vehicle ${payload.brand} ${payload.model} updated successfully`);
        setVehicles((prev) =>
          prev.map((v) => (v._id === editingVehicleId ? res.data.data : v))
        );
      } else {
        const res = await api.post('/vehicles', payload);
        setSuccessMessage(`Vehicle ${payload.brand} ${payload.model} added to fleet`);
        setVehicles((prev) => [res.data.data, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId, regNum) => {
    if (!window.confirm(`Are you sure you want to permanently delete vehicle ${regNum}?`)) {
      return;
    }

    try {
      setError('');
      await api.delete(`/vehicles/${vehicleId}`);
      setSuccessMessage(`Vehicle ${regNum} deleted successfully`);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const [exportLoading, setExportLoading] = useState(false);

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      setError('');
      const res = await api.get('/admin/reports/export-vehicles', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartFleet_Vehicles_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export fleet report');
    } finally {
      setExportLoading(false);
    }
  };

  const handleQuickStatusChange = async (vehicleId, newStatus) => {
    try {
      setError('');
      const res = await api.put(`/vehicles/${vehicleId}`, { status: newStatus });
      setVehicles((prev) => prev.map((v) => (v._id === vehicleId ? res.data.data : v)));
      setSuccessMessage(`Vehicle status changed to ${newStatus}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update vehicle status');
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (categoryFilter && v.category !== categoryFilter) return false;
      if (statusFilter && v.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const brandMatch = v.brand?.toLowerCase().includes(q);
        const modelMatch = v.model?.toLowerCase().includes(q);
        const regMatch = v.registrationNumber?.toLowerCase().includes(q);
        const locMatch = v.location?.toLowerCase().includes(q);
        if (!brandMatch && !modelMatch && !regMatch && !locMatch) return false;
      }
      return true;
    });
  }, [vehicles, categoryFilter, statusFilter, searchTerm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Fleet Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Configure and manage vehicles, pricing, availability, and registrations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            disabled={exportLoading || loading || vehicles.length === 0}
          >
            {exportLoading ? 'Exporting...' : '📥 Export CSV'}
          </button>
          <button onClick={fetchVehicles} className="btn btn-secondary btn-sm" disabled={loading}>
            🔄 Refresh
          </button>
          <button onClick={openAddModal} className="btn btn-primary btn-sm">
            + Add New Vehicle
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Fleet</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search brand, model, registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {VEHICLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {VEHICLE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading fleet vehicles..." />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          icon="🚗"
          title="No Vehicles Found"
          description="No fleet units match your current filter parameters or the fleet database is empty."
          actionLabel="+ Add First Vehicle"
          onAction={openAddModal}
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Registration</th>
                <th>Category</th>
                <th>Fuel / Gear</th>
                <th>Capacity</th>
                <th>Daily Rate</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.brand} {v.model}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year {v.year} • {v.mileage?.toLocaleString() || 0} km</div>
                  </td>
                  <td style={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                    {v.registrationNumber}
                  </td>
                  <td>{v.category}</td>
                  <td>{v.fuelType} • {v.transmission}</td>
                  <td>{v.seatingCapacity} Seats</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(v.pricePerDay)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{v.location}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        minWidth: '125px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        backgroundColor:
                          v.status === 'AVAILABLE'
                            ? 'var(--status-success-bg)'
                            : v.status === 'MAINTENANCE'
                            ? 'var(--status-warning-bg)'
                            : 'var(--surface-alt)',
                        color:
                          v.status === 'AVAILABLE'
                            ? 'var(--status-success-text)'
                            : v.status === 'MAINTENANCE'
                            ? 'var(--status-warning-text)'
                            : 'var(--text-main)',
                      }}
                      value={v.status}
                      onChange={(e) => handleQuickStatusChange(v._id, e.target.value)}
                    >
                      {VEHICLE_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEditModal(v)} className="btn btn-secondary btn-sm">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(v._id, v.registrationNumber)} className="btn btn-danger btn-sm">
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

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicleId ? 'Edit Vehicle Details' : 'Add New Fleet Vehicle'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g. Toyota"
              required
            />
            <FormInput
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g. Innova Crysta"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              min={1990}
              max={new Date().getFullYear() + 1}
              required
            />
            <FormInput
              label="Category"
              name="category"
              as="select"
              value={formData.category}
              onChange={handleInputChange}
              options={VEHICLE_CATEGORIES}
              required
            />
            <FormInput
              label="Registration No."
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="e.g. MH02EK4021"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Fuel Type"
              name="fuelType"
              as="select"
              value={formData.fuelType}
              onChange={handleInputChange}
              options={FUEL_TYPES}
              required
            />
            <FormInput
              label="Transmission"
              name="transmission"
              as="select"
              value={formData.transmission}
              onChange={handleInputChange}
              options={TRANSMISSION_TYPES}
              required
            />
            <FormInput
              label="Seats"
              name="seatingCapacity"
              type="number"
              value={formData.seatingCapacity}
              onChange={handleInputChange}
              min={1}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Price Per Day (₹)"
              name="pricePerDay"
              type="number"
              value={formData.pricePerDay}
              onChange={handleInputChange}
              min={0}
              required
            />
            <FormInput
              label="Current Status"
              name="status"
              as="select"
              value={formData.status}
              onChange={handleInputChange}
              options={VEHICLE_STATUSES}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stationed Location *</label>
            <input
              type="text"
              name="location"
              className="form-input"
              list="admin-locations"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Mumbai Airport Terminal 2"
              required
            />
            <datalist id="admin-locations">
              {POPULAR_LOCATIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Current Odometer (km)"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleInputChange}
              min={0}
            />
            <FormInput
              label="Next Service Date"
              name="nextServiceDate"
              type="date"
              value={formData.nextServiceDate}
              onChange={handleInputChange}
            />
          </div>

          <FormInput
            label="Image URLs (comma-separated)"
            name="images"
            value={formData.images}
            onChange={handleInputChange}
            placeholder="https://example.com/car1.jpg, https://example.com/car2.jpg"
          />

          <FormInput
            label="Features (comma-separated)"
            name="features"
            value={formData.features}
            onChange={handleInputChange}
            placeholder="Sunroof, Apple CarPlay, Cruise Control, Leather Seats"
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
              {submitting ? 'Saving...' : editingVehicleId ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVehicles;
