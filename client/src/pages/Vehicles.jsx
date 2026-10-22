import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { FALLBACK_VEHICLES } from '../utils/fallbackVehicles';
import {
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_STATUSES,
} from '../utils/constants';
import { SearchIcon, SlidersIcon, ShieldCheckIcon } from '../components/Icons';

const Vehicles = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDemoData, setIsDemoData] = useState(false);

  // Frontend Filter States initialized from URL params if present
  const [searchTerm, setSearchTerm] = useState(searchParams.get('location') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [fuelFilter, setFuelFilter] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/vehicles');
      if (res.data && res.data.data && res.data.data.length > 0) {
        setVehicles(res.data.data);
        setIsDemoData(false);
      } else {
        // Use realistic showcase fleet
        setVehicles(FALLBACK_VEHICLES);
        setIsDemoData(true);
      }
    } catch (err) {
      // Graceful resilient fallback for local offline / testing
      setVehicles(FALLBACK_VEHICLES);
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Update filters if URL parameters change
  useEffect(() => {
    const loc = searchParams.get('location');
    const cat = searchParams.get('category');
    if (loc !== null) setSearchTerm(loc);
    if (cat !== null) setCategoryFilter(cat);
  }, [searchParams]);

  // Instant client-side filtering over fetched vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Search text match (brand, model, location, registration)
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const brandMatch = v.brand?.toLowerCase().includes(query);
        const modelMatch = v.model?.toLowerCase().includes(query);
        const locationMatch = v.location?.toLowerCase().includes(query);
        const regMatch = v.registrationNumber?.toLowerCase().includes(query);
        if (!brandMatch && !modelMatch && !locationMatch && !regMatch) {
          return false;
        }
      }

      // Category match
      if (categoryFilter && v.category !== categoryFilter) {
        return false;
      }

      // Fuel type match
      if (fuelFilter && v.fuelType !== fuelFilter) {
        return false;
      }

      // Transmission match
      if (transmissionFilter && v.transmission !== transmissionFilter) {
        return false;
      }

      // Status match
      if (statusFilter && v.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchTerm, categoryFilter, fuelFilter, transmissionFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setFuelFilter('');
    setTransmissionFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters =
    Boolean(searchTerm || categoryFilter || fuelFilter || transmissionFilter || statusFilter);

  return (
    <div className="vehicles-page-container">
      {/* Page Header */}
      <div className="vehicles-header">
        <div>
          <div className="sub-badge">FLEET INVENTORY</div>
          <h1 className="page-heading">Our Executive Vehicle Fleet</h1>
          <p className="page-subheading">
            Browse and reserve from our premium selection of fully insured, sanitized, and inspected vehicles.
          </p>
        </div>

        <div className="fleet-stat-badge">
          <ShieldCheckIcon size={18} color="#10B981" />
          <span>{filteredVehicles.length} Vehicles Available</span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="filter-console-card">
        <div className="filter-controls-grid">
          {/* Search Input */}
          <div className="search-field-col">
            <label className="form-label">
              <SearchIcon size={14} color="#0D9488" /> Search Fleet
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by brand, model, city, or airport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {VEHICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Fuel Filter */}
          <div>
            <label className="form-label">Fuel Type</label>
            <select
              className="form-select"
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
            >
              <option value="">All Fuels</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Transmission Filter */}
          <div>
            <label className="form-label">Gearbox</label>
            <select
              className="form-select"
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
            >
              <option value="">All Transmissions</option>
              {TRANSMISSION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label">Availability</label>
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

        {hasActiveFilters && (
          <div className="filter-actions-bar">
            <span className="results-count-text">
              Showing <strong>{filteredVehicles.length}</strong> of {vehicles.length} fleet vehicles
            </span>
            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
              Reset All Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <LoadingSpinner message="Scanning vehicle availability & live GPS..." />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Vehicles Match Your Selected Filters"
          description="Try broadening your filters, choosing a different city, or clearing search keywords."
          actionLabel="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid-cards">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
