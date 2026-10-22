import React, { useState } from 'react';
import Modal from './Modal';
import api from '../services/api';
import ErrorMessage from './ErrorMessage';

const ReviewModal = ({ isOpen, onClose, vehicle, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Please write a brief feedback comment');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reviews', {
        vehicleId: vehicle._id,
        rating,
        comment: comment.trim(),
      });

      setComment('');
      setRating(5);
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review ${vehicle.brand} ${vehicle.model}`}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} onClose={() => setError('')} />

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            How was your driving experience with this vehicle?
          </p>

          {/* Star Rating Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', fontSize: '2rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  lineHeight: 1,
                  color: (hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1',
                  transition: 'transform 0.15s ease, color 0.15s ease',
                  transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                }}
                aria-label={`${star} Stars`}
              >
                ★
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
            {rating} of 5 Stars
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Your Feedback / Review *</label>
          <textarea
            className="form-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about performance, comfort, fuel efficiency, or condition..."
            rows={4}
            required
            maxLength={500}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Max 500 characters
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
