import React from 'react';
import Modal from './Modal';
import { formatCurrency, formatDate } from '../utils/formatters';

const InvoiceModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  const vehicle = booking.vehicle || {};
  const customer = booking.customer || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official GST Tax Invoice"
      maxWidth="720px"
    >
      <div id="printable-invoice" style={{ padding: '0.5rem 0' }}>
        {/* Invoice Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--surface-border)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              ⚡ SmartFleet Mobility
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              SmartFleet Fleet & Rental Technologies Ltd.<br />
              Regus Tech Park, Bandra Kurla Complex, Mumbai 400051<br />
              <strong>GSTIN:</strong> 27AABCS1429B1Z2 | <strong>CIN:</strong> U74999MH2026PTC109823
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              INV-{booking._id.slice(-8).toUpperCase()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Date: {formatDate(booking.createdAt || new Date())}
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ padding: '1rem', background: 'var(--glass-bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Billed To Customer
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{customer.name || 'Registered Customer'}</div>
            <div style={{ color: 'var(--text-muted)' }}>{customer.email || 'Email on file'}</div>
            <div style={{ color: 'var(--text-muted)' }}>{customer.phone || 'Phone on file'}</div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--glass-bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Vehicle & Rental Schedule
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{vehicle.brand} {vehicle.model} ({vehicle.registrationNumber || 'Fleet'})</div>
            <div style={{ color: 'var(--text-muted)' }}>
              Pickup: {formatDate(booking.pickupDate)} ({booking.pickupLocation})
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Return: {formatDate(booking.returnDate)} ({booking.returnLocation})
            </div>
          </div>
        </div>

        {/* Itemized Fare Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)', borderBottom: '2px solid var(--surface-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Duration</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong>Self-Drive Vehicle Rental</strong><br />
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {vehicle.brand} {vehicle.model} @ {formatCurrency(vehicle.pricePerDay || (booking.baseAmount / booking.numberOfDays))}/day
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(booking.baseAmount)}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong>Statutory Goods & Services Tax (GST)</strong><br />
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    CGST (9%) + SGST (9%)
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>18%</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(booking.taxAmount)}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <strong>Comprehensive Collision Damage Waiver (CDW)</strong><br />
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Full roadside assistance & zero-depreciation coverage
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Flat</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(booking.insuranceAmount)}
                </td>
              </tr>

              <tr style={{ background: 'var(--glass-bg-alt)', fontWeight: 800, fontSize: '1.05rem' }}>
                <td style={{ padding: '1rem', color: 'var(--text-main)' }}>Total Billed Amount (INR)</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)' }}>
                  {formatCurrency(booking.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Confirmation Badge & Razorpay ID */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1rem',
            background: booking.paymentStatus === 'PAID' ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
            border: `1px solid ${booking.paymentStatus === 'PAID' ? 'var(--status-success-border)' : 'var(--status-warning-border)'}`,
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <strong>Payment Status:</strong> {booking.paymentStatus}
            {booking.razorpayPaymentId && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                (Transaction ID: {booking.razorpayPaymentId})
              </span>
            )}
          </div>
          <div>
            <strong>Booking:</strong> {booking.status}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }} className="no-print">
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            🖨️ Print / Save PDF
          </button>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default InvoiceModal;
