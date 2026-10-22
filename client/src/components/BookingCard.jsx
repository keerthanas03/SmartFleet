import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import InvoiceModal from './InvoiceModal';
import Modal from './Modal';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const BookingCard = ({ booking, onBookingUpdated }) => {
  const vehicle = booking.vehicle || {};
  const isPaymentPending = booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED';
  const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    try {
      setCancelLoading(true);
      setCancelError('');
      await api.put(`/bookings/${booking._id}/cancel`, {
        reason: cancellationReason || 'Cancelled by customer',
      });
      setIsCancelModalOpen(false);
      if (onBookingUpdated) {
        onBookingUpdated();
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
            BOOKING ID: #{booking._id.slice(-8).toUpperCase()}
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
            {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle Details Unavailable'}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {vehicle.category} • {vehicle.registrationNumber || 'Fleet Vehicle'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <StatusBadge status={booking.status} />
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      {/* Booking Itinerary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          padding: '1rem',
          background: 'var(--glass-bg-alt)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8)',
          fontSize: '0.85rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>PICKUP</div>
          <div style={{ fontWeight: 600 }}>{formatDate(booking.pickupDate)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📍 {booking.pickupLocation}</div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>RETURN</div>
          <div style={{ fontWeight: 600 }}>{formatDate(booking.returnDate)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📍 {booking.returnLocation}</div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DURATION</div>
          <div style={{ fontWeight: 600 }}>{booking.numberOfDays} {booking.numberOfDays === 1 ? 'Day' : 'Days'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Base: {formatCurrency(booking.baseAmount)}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TOTAL AMOUNT</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatCurrency(booking.totalAmount)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Incl. 18% GST + Ins.
          </div>
        </div>
      </div>

      {/* Cancellation Notice if Cancelled */}
      {booking.status === 'CANCELLED' && (
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--status-danger-text)' }}>
          <strong>Reservation Cancelled:</strong> {booking.cancellationReason || 'No reason specified'}
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setIsInvoiceOpen(true)}
          className="btn btn-secondary btn-sm"
          title="Print or view Tax Invoice"
        >
          📄 View Invoice
        </button>

        {isPaymentPending && (
          <Link
            to={`/payment?bookingId=${booking._id}`}
            className="btn btn-primary btn-sm"
          >
            💳 Pay Now ({formatCurrency(booking.totalAmount)})
          </Link>
        )}

        {vehicle._id && (
          <Link
            to={`/vehicles/${vehicle._id}`}
            className="btn btn-secondary btn-sm"
          >
            Vehicle Specs
          </Link>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="btn btn-danger btn-sm"
          >
            ✕ Cancel Trip
          </button>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        booking={booking}
      />

      {/* Cancellation Prompt Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Reservation"
      >
        <form onSubmit={handleCancelBooking}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Are you sure you want to cancel your reservation for <strong>{vehicle.brand} {vehicle.model}</strong>? 
            Any completed payments will be processed for refund per SmartFleet cancellation terms.
          </p>

          {cancelError && (
            <div style={{ color: 'var(--status-danger-text)', backgroundColor: 'var(--status-danger-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {cancelError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason for cancellation (optional):</label>
            <textarea
              className="form-input"
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Change in travel schedule, booked wrong dates..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={cancelLoading}
            >
              Keep Reservation
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingCard;
