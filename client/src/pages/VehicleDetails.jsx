import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ReviewModal from '../components/ReviewModal';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';
import { POPULAR_LOCATIONS } from '../utils/constants';
import { FALLBACK_VEHICLES } from '../utils/fallbackVehicles';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [pickupDate, setPickupDate] = useState(formatDateForInput(tomorrow));
  const [returnDate, setReturnDate] = useState(formatDateForInput(dayAfter));
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');

  const fetchReviews = async () => {
    try {
      if (id && id.startsWith('demo-')) {
        setReviews([
          {
            _id: 'r1',
            user: { name: 'Vikram Sethi' },
            rating: 5,
            comment: 'Exceptionally smooth drive, immaculate cabin condition and prompt contactless handover.',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'r2',
            user: { name: 'Ananya Iyer' },
            rating: 5,
            comment: 'Rented for a corporate client visit. Highly professional and spotless car.',
            createdAt: new Date().toISOString(),
          },
        ]);
        setAverageRating(5.0);
        setReviewsCount(2);
        return;
      }
      const res = await api.get(`/reviews/vehicle/${id}`);
      setReviews(res.data.data || []);
      setAverageRating(res.data.averageRating || 5.0);
      setReviewsCount(res.data.count || 0);
    } catch (err) {
      console.warn('Could not fetch reviews:', err.message);
    }
  };

  // Fetch vehicle details & reviews
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/vehicles/${id}`);
        setVehicle(res.data.data);
        if (res.data.data?.location) {
          setPickupLocation(res.data.data.location);
          setReturnLocation(res.data.data.location);
        }
      } catch (err) {
        const fallback = FALLBACK_VEHICLES.find((v) => v._id === id);
        if (fallback) {
          setVehicle(fallback);
          setPickupLocation(fallback.location);
          setReturnLocation(fallback.location);
          setError('');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch vehicle information');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
    fetchReviews();
  }, [id]);

  // Live Price Calculation
  const priceCalculations = useMemo(() => {
    if (!vehicle || !pickupDate || !returnDate) {
      return { days: 0, baseAmount: 0, taxAmount: 0, insuranceAmount: 500, totalAmount: 0, isValid: false };
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return { days: 0, baseAmount: 0, taxAmount: 0, insuranceAmount: 500, totalAmount: 0, isValid: false };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const baseAmount = days * vehicle.pricePerDay;
    const taxAmount = Math.round(baseAmount * 0.18);
    const insuranceAmount = 500;
    const totalAmount = baseAmount + taxAmount + insuranceAmount;

    return {
      days,
      baseAmount,
      taxAmount,
      insuranceAmount,
      totalAmount,
      isValid: true,
    };
  }, [vehicle, pickupDate, returnDate]);

  // Check Availability
  const handleCheckAvailability = async () => {
    if (!priceCalculations.isValid) {
      setError('Please select valid pickup and return dates');
      return;
    }

    if (id && id.startsWith('demo-')) {
      setAvailabilityMessage({
        available: true,
        text: 'Vehicle is confirmed available for selected dates! (Instant Verified)',
      });
      return;
    }

    try {
      setAvailabilityMessage(null);
      const res = await api.get('/bookings/availability', {
        params: {
          vehicleId: id,
          pickupDate,
          returnDate,
        },
      });

      setAvailabilityMessage({
        available: res.data.available,
        text: res.data.message,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify vehicle availability');
    }
  };

  // Submit Booking
  const handleBookNow = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/vehicles/${id}` } } });
      return;
    }

    if (!priceCalculations.isValid) {
      setError('Return date must be strictly after pickup date');
      return;
    }

    if (!pickupLocation || !returnLocation) {
      setError('Please choose your pickup and return locations');
      return;
    }

    if (id && id.startsWith('demo-')) {
      // Simulate booking voucher for demo preview
      const demoId = `demo-booking-${Date.now()}`;
      const demoBooking = {
        _id: demoId,
        bookingReference: `SF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicle,
        pickupDate,
        returnDate,
        totalDays: priceCalculations.days,
        basePrice: priceCalculations.baseAmount,
        taxAmount: priceCalculations.taxAmount,
        insuranceAmount: priceCalculations.insuranceAmount,
        totalAmount: priceCalculations.totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        pickupLocation,
        returnLocation,
      };

      try {
        localStorage.setItem('smartfleet_last_booking', JSON.stringify(demoBooking));
      } catch (e) {}

      navigate(`/payment?bookingId=${demoId}`, {
        state: { booking: demoBooking },
      });
      return;
    }

    try {
      setBookingLoading(true);
      const res = await api.post('/bookings', {
        vehicleId: id,
        pickupDate,
        returnDate,
        pickupLocation,
        returnLocation,
      });

      if (res.data?.data?._id) {
        try {
          localStorage.setItem('smartfleet_last_booking', JSON.stringify(res.data.data));
        } catch (e) {}
        navigate(`/payment?bookingId=${res.data.data._id}`, {
          state: { booking: res.data.data },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading vehicle specifications..." fullPage />;
  }

  if (!vehicle) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Vehicle Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>The requested vehicle does not exist or has been removed.</p>
        <Link to="/vehicles" className="btn btn-primary">Back to Fleet</Link>
      </div>
    );
  }

  const fallbackImage = '/images/innova-crysta.jpg';
  const primaryImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : fallbackImage;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/vehicles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ← Back to All Vehicles
        </Link>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Vehicle Details */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: 'var(--surface-alt)' }}>
              <img
                src={primaryImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
              />
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <StatusBadge status={vehicle.status} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                  color: '#0F172A',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 750,
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 4px 14px rgba(13, 148, 136, 0.12)',
                }}
              >
                {vehicle.category} • Reg: {vehicle.registrationNumber}
              </div>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.85rem' }}>{vehicle.brand} {vehicle.model}</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Model Year {vehicle.year} • 📍 Stationed at {vehicle.location}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 650 }}>Daily Rate</span>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.025em' }}>
                    {formatCurrency(vehicle.pricePerDay)}
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  marginBottom: '1.5rem',
                  padding: '1.15rem 1rem',
                  backgroundColor: 'var(--surface-alt)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '0.06em', color: '#64748B' }}>FUEL</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 750, fontSize: '0.95rem', color: '#0F172A', marginTop: '0.2rem' }}>{vehicle.fuelType}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '0.06em', color: '#64748B' }}>TRANSMISSION</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 750, fontSize: '0.95rem', color: '#0F172A', marginTop: '0.2rem' }}>{vehicle.transmission}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '0.06em', color: '#64748B' }}>CAPACITY</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 750, fontSize: '0.95rem', color: '#0F172A', marginTop: '0.2rem' }}>{vehicle.seatingCapacity} Seats</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '0.06em', color: '#64748B' }}>ODOMETER</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 750, fontSize: '0.95rem', color: '#0F172A', marginTop: '0.2rem' }}>{vehicle.mileage?.toLocaleString() || '0'} km</div>
                </div>
              </div>

              {/* Vehicle Features */}
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Features & Amenities</h3>
                {vehicle.features && vehicle.features.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {vehicle.features.map((feature, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'var(--surface-alt)',
                          border: '1px solid var(--surface-border)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Standard manufacturer features included.</p>
                )}
              </div>

              {/* Customer Reviews & Ratings */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>⭐ {averageRating.toFixed(1)}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        ({reviewsCount} {reviewsCount === 1 ? 'verified review' : 'verified reviews'})
                      </span>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real feedback from certified renters</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login', { state: { from: { pathname: `/vehicles/${id}` } } });
                      } else {
                        setIsReviewModalOpen(true);
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    ✍️ Write a Review
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No reviews yet. Be the first to rent and rate this vehicle!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((rev) => (
                      <div
                        key={rev._id}
                        style={{
                          backgroundColor: 'var(--surface-alt)',
                          border: '1px solid var(--surface-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem 1.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                              {rev.user?.name || 'Verified Renter'}
                            </div>
                            <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                              {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {formatDate(rev.createdAt)}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Booking Calculator */}
        <div>
          <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Reserve This Vehicle</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Select your trip schedule to calculate transparent rental costs.
            </p>

            <form onSubmit={handleBookNow}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Pickup Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={pickupDate}
                    min={formatDateForInput(new Date())}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Return Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={returnDate}
                    min={pickupDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Pickup Location *</label>
                <input
                  type="text"
                  className="form-input"
                  list="popular-locations"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Select or enter pickup station"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Return Location *</label>
                <input
                  type="text"
                  className="form-input"
                  list="popular-locations"
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  placeholder="Select or enter drop-off station"
                  required
                />
              </div>

              <datalist id="popular-locations">
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>

              <button
                type="button"
                onClick={handleCheckAvailability}
                className="btn btn-secondary btn-sm btn-full"
                style={{ marginBottom: '1.25rem' }}
              >
                🔎 Check Date Availability
              </button>

              {availabilityMessage && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: availabilityMessage.available ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                    color: availabilityMessage.available ? 'var(--status-success-text)' : 'var(--status-danger-text)',
                    border: `1px solid ${availabilityMessage.available ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`,
                  }}
                >
                  {availabilityMessage.available ? '✓ ' : '✕ '}
                  {availabilityMessage.text}
                </div>
              )}

              {/* Price Breakdown */}
              {priceCalculations.isValid && (
                <div
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    Transparent Price Breakdown
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                    <span>Rental ({priceCalculations.days} {priceCalculations.days === 1 ? 'day' : 'days'} × {formatCurrency(vehicle.pricePerDay)})</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(priceCalculations.baseAmount)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                    <span>GST (18% Statutory Tax)</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(priceCalculations.taxAmount)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Comprehensive Collision Insurance</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(priceCalculations.insuranceAmount)}</span>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid var(--surface-border)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>Total Estimated Fare</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(priceCalculations.totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={bookingLoading || vehicle.status !== 'AVAILABLE'}
              >
                {bookingLoading
                  ? 'Reserving Vehicle...'
                  : vehicle.status !== 'AVAILABLE'
                  ? `Unavailable (${vehicle.status})`
                  : 'Proceed to Book Now →'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        vehicle={vehicle}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
};

export default VehicleDetails;
