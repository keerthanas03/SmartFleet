import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '📂',
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--glass-border-subtle)',
        boxShadow: 'var(--glass-shadow)',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
