import React from 'react';

const StatCard = ({ title, value, icon, subtitle, color = 'var(--primary)' }) => {
  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.4rem 1.6rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.15, marginTop: '0.2rem' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Decorative colored glow edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    </div>
  );
};

export default StatCard;
