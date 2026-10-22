import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Verification = () => {
  const { updateUser } = useAuth();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected file states
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/verification/status');
      setStatusData(res.data.data);
      if (res.data.data?.verificationStatus) {
        updateUser({ verificationStatus: res.data.data.verificationStatus });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch verification status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!drivingLicenseFile || !idProofFile) {
      setError('Please select both your Driving License and ID Proof files before submitting.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('drivingLicense', drivingLicenseFile);
      formData.append('idProof', idProofFile);

      const res = await api.post('/verification/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Documents uploaded successfully! Your verification is now pending admin review.');
      setStatusData(res.data.data);
      updateUser({ verificationStatus: 'pending' });
      setDrivingLicenseFile(null);
      setIdProofFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Document upload failed. Please ensure file sizes are under 5MB.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking document verification status..." fullPage />;
  }

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Identity Verification</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Upload your legal credentials for safety compliance and express vehicle key handovers.
        </p>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {successMessage && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            color: 'var(--status-success-text)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {/* Current Status Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT STATUS</div>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
              Account Verification Review
            </h3>
          </div>
          <StatusBadge status={statusData?.verificationStatus || 'pending'} />
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
          {statusData?.verificationStatus === 'approved'
            ? 'Your documents have been verified and approved by the SmartFleet administration team. You are authorized to drive all rental vehicles.'
            : statusData?.verificationStatus === 'rejected'
            ? 'Your submitted documents were rejected. Please review our guidelines below and re-upload valid government credentials.'
            : 'Your documents are pending review. The compliance team typically reviews uploads within 2-4 business hours.'}
        </p>

        {/* Existing Document Links */}
        {(statusData?.drivingLicense || statusData?.idProof) && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              backgroundColor: 'var(--surface-alt)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {statusData.drivingLicense && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DRIVING LICENSE:</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <a
                    href={statusData.drivingLicense}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    📄 View License File
                  </a>
                </div>
              </div>
            )}

            {statusData.idProof && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GOVERNMENT ID PROOF:</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <a
                    href={statusData.idProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    📄 View ID File
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Form */}
      {statusData?.verificationStatus !== 'approved' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
            {statusData?.drivingLicense ? 'Re-upload Credentials' : 'Upload Required Documents'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Supported Formats: JPG, JPEG, PNG, PDF (Max size: 5MB per document).
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                1. Driving License <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="form-input"
                onChange={(e) => setDrivingLicenseFile(e.target.files[0])}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Valid driver's license showing license number, full name, and expiration date.
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">
                2. Government ID Proof <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="form-input"
                onChange={(e) => setIdProofFile(e.target.files[0])}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Aadhaar card, Passport, or Voter ID with clear address and portrait photo.
              </span>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '1.5rem' }}
            >
              {uploading ? 'Uploading Documents Securely...' : 'Submit Documents for Verification'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Verification;
