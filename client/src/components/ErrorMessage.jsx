import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.95rem 1.35rem',
        backgroundColor: 'var(--status-danger-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--status-danger-border)',
        color: 'var(--status-danger-text)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)',
        marginBottom: '1.25rem',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>⚠️</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--status-danger-text)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '0.2rem',
          }}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
