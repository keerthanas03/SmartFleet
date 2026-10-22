import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/formatters';
import {
  MapPinIcon,
  FuelIcon,
  SlidersIcon,
  UsersIcon,
  StarIcon,
  ShieldCheckIcon,
} from './Icons';

const VehicleCard = ({ vehicle }) => {
  const fallbackImage = '/images/bmw-3series.jpg';
  const primaryImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : fallbackImage;

  return (
    <div className="vehicle-card card-hover">
      {/* Image container */}
      <div className="vcard-image-wrap">
        <img
          src={primaryImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vcard-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        <div className="vcard-badge-top-right">
          <StatusBadge status={vehicle.status} />
        </div>
        <div className={`vcard-category-pill cat-${vehicle.category?.toLowerCase()}`}>
          {vehicle.category}
        </div>
      </div>

      {/* Details Container */}
      <div className="vcard-content">
        <div className="vcard-header-row">
          <div>
            <h3 className="vcard-title">
              {vehicle.brand} {vehicle.model}
            </h3>
            <span className="vcard-location">
              <MapPinIcon size={14} color="#0D9488" /> {vehicle.location}
            </span>
          </div>
          <span className="vcard-year">{vehicle.year}</span>
        </div>

        {/* Specs Grid */}
        <div className="vcard-specs-grid">
          <div className="vcard-spec-item">
            <FuelIcon size={14} color="#0D9488" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="vcard-spec-item border-sides">
            <SlidersIcon size={14} color="#7C3AED" />
            <span>{vehicle.transmission}</span>
          </div>
          <div className="vcard-spec-item">
            <UsersIcon size={14} color="#059669" />
            <span>{vehicle.seatingCapacity} Seats</span>
          </div>
        </div>

        {/* Quality guarantee pill */}
        <div className="vcard-guarantee-pill">
          <ShieldCheckIcon size={14} color="#059669" />
          <span>Sanitized • 100% Insured • Zero Deposit</span>
        </div>

        {/* Footer with Price and Action */}
        <div className="vcard-footer">
          <div>
            <span className="vcard-price-label">Rental rate</span>
            <div className="vcard-price-row">
              <span className="vcard-price-val">{formatCurrency(vehicle.pricePerDay)}</span>
              <span className="vcard-price-unit">/day</span>
            </div>
          </div>
          <Link
            to={`/vehicles/${vehicle._id}`}
            className="btn btn-primary btn-sm btn-shimmer"
          >
            Reserve Now →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
