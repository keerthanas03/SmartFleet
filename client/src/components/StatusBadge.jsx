import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  let badgeClass = 'badge-slate';

  switch (normalized) {
    case 'AVAILABLE':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'PAID':
    case 'APPROVED':
      badgeClass = 'badge-success';
      break;

    case 'PENDING':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
      badgeClass = 'badge-warning';
      break;

    case 'MAINTENANCE':
    case 'CANCELLED':
    case 'FAILED':
    case 'REJECTED':
      badgeClass = 'badge-danger';
      break;

    case 'RENTED':
    case 'BOOKED':
    case 'ACTIVE':
      badgeClass = 'badge-info';
      break;

    case 'INACTIVE':
    case 'REFUNDED':
    default:
      badgeClass = 'badge-slate';
      break;
  }

  // Display user-friendly label
  let label = status;
  if (status === 'IN_PROGRESS') label = 'In Progress';
  if (status === 'pending') label = 'Pending';
  if (status === 'approved') label = 'Approved';
  if (status === 'rejected') label = 'Rejected';

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

export default StatusBadge;
