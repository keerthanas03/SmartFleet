import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CarIcon,
  ShieldCheckIcon,
  ZapIcon,
  KeyIcon,
  CreditCardIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  FuelIcon,
  SlidersIcon,
  UsersIcon,
} from '../components/Icons';
import { formatCurrency } from '../utils/formatters';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Hero Quick Search Form State
  const [searchCity, setSearchCity] = useState('Bengaluru');
  const [searchCategory, setSearchCategory] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toISOString().split('T')[0];
  });

  // Interactive Rental Cost Estimator State
  const [calcCategory, setCalcCategory] = useState('Sedan');
  const [calcDays, setCalcDays] = useState(3);
  const [insuranceWaiver, setInsuranceWaiver] = useState(true);
  const [airportDelivery, setAirportDelivery] = useState(false);

  const rates = {
    Hatchback: { base: 1800, name: 'Urban Compact (i20, Polo, Swift)' },
    Sedan: { base: 3200, name: 'Executive Sedan (City, Verna, Ciaz)' },
    SUV: { base: 4500, name: 'Premium SUV (XUV700, Harrier, Safari)' },
    Luxury: { base: 7500, name: 'Luxury Class (BMW 3 Series, Mercedes C-Class)' },
    Electric: { base: 3600, name: 'Clean Energy EV (Nexon EV, ZS EV)' },
  };

  const currentRate = rates[calcCategory] || rates.Sedan;
  const baseTotal = currentRate.base * calcDays;
  const discountPercent = calcDays >= 7 ? 0.15 : calcDays >= 3 ? 0.1 : 0;
  const discountAmount = Math.round(baseTotal * discountPercent);
  const insuranceCost = insuranceWaiver ? 350 * calcDays : 0;
  const deliveryCost = airportDelivery ? 600 : 0;
  const subtotal = baseTotal - discountAmount + insuranceCost + deliveryCost;
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('location', searchCity);
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="home-container">
      {/* =========================================================================
          HERO SECTION: High-Impact Luxury Automotive Design
         ========================================================================= */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Column: Headlines & Callouts */}
          <div className="hero-content">
            <div className="hero-pill-tag">
              <span className="hero-sparkle">✦</span>
              <span>INTELLIGENT MOBILITY & FLEET NETWORK</span>
            </div>

            <h1 className="hero-title">
              Executive Fleet Rentals, <br />
              <span className="gradient-text">Engineered for Freedom.</span>
            </h1>

            <p className="hero-subtitle">
              Experience seamless self-drive luxury across India. Fully insured, meticulously sanitized, and ready for instant keyless contactless pickup.
            </p>

            {/* Quick Hero Badges */}
            <div className="hero-trust-row">
              <div className="hero-trust-badge">
                <ShieldCheckIcon size={18} color="#10B981" />
                <span>100% Comprehensive Insurance</span>
              </div>
              <div className="hero-trust-badge">
                <ZapIcon size={18} color="#0D9488" />
                <span>Instant Digital Keys</span>
              </div>
              <div className="hero-trust-badge">
                <CheckCircleIcon size={18} color="#F59E0B" />
                <span>Zero Hidden Fees</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Floating Automotive Spotlight */}
          <div className="hero-spotlight-card">
            <div className="spotlight-image-container">
              <img
                src="/images/bmw-3series.jpg"
                alt="BMW 3 Series Gran Limousine M-Sport"
                className="spotlight-image"
              />
              <div className="spotlight-gradient-fade" />
              <div className="spotlight-live-pill">
                <span className="pulse-dot"></span> AVAILABLE IN CHENNAI & TOP METROS
              </div>
              <div className="spotlight-badge-cat">EXECUTIVE CLASS</div>
            </div>

            <div className="spotlight-details">
              <div className="spotlight-header">
                <div>
                  <h3 className="spotlight-car-name">BMW 3 Series Gran Limousine</h3>
                  <div className="spotlight-car-sub">TwinPower Turbo 258 BHP • Portimao Blue</div>
                </div>
                <div className="spotlight-price-tag">
                  <span className="rate-num">₹6,800</span>
                  <span className="rate-per">/day</span>
                </div>
              </div>

              <div className="spotlight-specs-row">
                <div className="spotlight-spec">
                  <FuelIcon size={15} color="#0D9488" />
                  <span>Petrol</span>
                </div>
                <div className="spotlight-spec">
                  <SlidersIcon size={15} color="#7C3AED" />
                  <span>8-Spd Auto</span>
                </div>
                <div className="spotlight-spec">
                  <UsersIcon size={15} color="#059669" />
                  <span>5 Seats</span>
                </div>
                <div className="spotlight-spec">
                  <StarIcon size={15} color="#f59e0b" fill="#f59e0b" />
                  <span>4.98 (42 trips)</span>
                </div>
              </div>

              <div className="spotlight-actions">
                <Link to="/vehicles" className="btn btn-primary btn-sm btn-full btn-shimmer">
                  View This Vehicle & More Fleet →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FLEET SEARCH CONSOLE (Hero Bottom Console)
           ========================================================================= */}
        <div className="hero-search-console">
          <form onSubmit={handleHeroSearch} className="search-console-form">
            <div className="console-field">
              <label className="console-label">
                <MapPinIcon size={16} color="#0D9488" /> Pickup City
              </label>
              <select
                className="console-select"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              >
                <option value="Chennai">Chennai (MAA Airport, OMR & T. Nagar)</option>
                <option value="Bengaluru">Bengaluru (BLR Airport & City)</option>
                <option value="Mumbai">Mumbai (BKC, Airport & South)</option>
                <option value="Delhi NCR">Delhi NCR (Airport & CyberCity)</option>
                <option value="Hyderabad">Hyderabad (Gachibowli & HiTech)</option>
                <option value="Goa">Goa (Mopa & Dabolim Airports)</option>
              </select>
            </div>

            <div className="console-field">
              <label className="console-label">
                <CarIcon size={16} color="#7C3AED" /> Vehicle Type
              </label>
              <select
                className="console-select"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">All Fleet Categories</option>
                <option value="Luxury">Executive & Luxury Sedans</option>
                <option value="SUV">Premium All-Terrain SUVs</option>
                <option value="Electric">Electric & Clean Energy EVs</option>
                <option value="Sedan">Comfort Business Sedans</option>
                <option value="Hatchback">Urban Economy Compacts</option>
              </select>
            </div>

            <div className="console-field">
              <label className="console-label">
                <CalendarIcon size={16} color="#059669" /> Pickup Date
              </label>
              <input
                type="date"
                className="console-input"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>

            <div className="console-field">
              <label className="console-label">
                <CalendarIcon size={16} color="#EA580C" /> Return Date
              </label>
              <input
                type="date"
                className="console-input"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>

            <div className="console-action-field">
              <button type="submit" className="btn btn-primary btn-lg console-submit-btn btn-shimmer">
                Find Available Fleet →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =========================================================================
          KEY STATS TICKER STRIP
         ========================================================================= */}
      <section className="stats-ticker-strip">
        <div className="stat-ticker-item">
          <div className="ticker-number">50+</div>
          <div className="ticker-label">Premium Fleet Vehicles</div>
        </div>
        <div className="ticker-divider" />
        <div className="stat-ticker-item">
          <div className="ticker-number">99.8%</div>
          <div className="ticker-label">On-Time Handover Rate</div>
        </div>
        <div className="ticker-divider" />
        <div className="stat-ticker-item">
          <div className="ticker-number">4.92 ★</div>
          <div className="ticker-label">Verified Customer Score</div>
        </div>
        <div className="ticker-divider" />
        <div className="stat-ticker-item">
          <div className="ticker-number">15 Mins</div>
          <div className="ticker-label">Contactless Key Pickup</div>
        </div>
      </section>

      {/* =========================================================================
          FLEET CATEGORIES EXPLORER
         ========================================================================= */}
      <section className="section-block">
        <div className="section-header-centered">
          <div className="sub-badge">CURATED VEHICLE CLASSES</div>
          <h2 className="section-title">Engineered for Every Purpose</h2>
          <p className="section-description">
            Choose from high-performance sedans, commanding SUVs, and zero-emission electric vehicles.
          </p>
        </div>

        <div className="categories-grid">
          {/* Category 1: Executive Sedans */}
          <Link to="/vehicles?category=Luxury" className="category-card card-hover">
            <div className="category-image-wrap">
              <img
                src="/images/bmw-3series.jpg"
                alt="Executive Sedans"
                className="category-image"
              />
              <div className="category-overlay" />
              <span className="category-badge">Luxury & Executive</span>
            </div>
            <div className="category-info">
              <h3 className="category-name">Executive Sedans</h3>
              <p className="category-desc">BMW 3 Series Gran Limousine. Supreme comfort, executive prestige & dynamics.</p>
              <div className="category-footer">
                <span className="category-price">From ₹6,500/day</span>
                <span className="category-link-arrow">Explore →</span>
              </div>
            </div>
          </Link>

          {/* Category 2: SUVs */}
          <Link to="/vehicles?category=SUV" className="category-card card-hover">
            <div className="category-image-wrap">
              <img
                src="/images/mahindra-xuv700.jpg"
                alt="Premium SUVs"
                className="category-image"
              />
              <div className="category-overlay" />
              <span className="category-badge">High Ground Clearance</span>
            </div>
            <div className="category-info">
              <h3 className="category-name">Premium All-Terrain SUVs</h3>
              <p className="category-desc">Mahindra XUV700, Toyota Innova Crysta. Commanding presence, ADAS safety & 7 seats.</p>
              <div className="category-footer">
                <span className="category-price">From ₹4,200/day</span>
                <span className="category-link-arrow">Explore →</span>
              </div>
            </div>
          </Link>

          {/* Category 3: Electric Vehicles */}
          <Link to="/vehicles?category=Electric" className="category-card card-hover">
            <div className="category-image-wrap">
              <img
                src="/images/tata-nexon-ev.jpg"
                alt="Electric Vehicles"
                className="category-image"
              />
              <div className="category-overlay" />
              <span className="category-badge">Zero Emissions</span>
            </div>
            <div className="category-info">
              <h3 className="category-name">Clean Energy & Hybrid EVs</h3>
              <p className="category-desc">Tata Nexon EV Empowered Plus. Silent electric torque with fast DC supercharging.</p>
              <div className="category-footer">
                <span className="category-price">From ₹3,400/day</span>
                <span className="category-link-arrow">Explore →</span>
              </div>
            </div>
          </Link>

          {/* Category 4: Urban Compacts */}
          <Link to="/vehicles?category=Hatchback" className="category-card card-hover">
            <div className="category-image-wrap">
              <img
                src="/images/maruti-swift.jpg"
                alt="Urban Compacts"
                className="category-image"
              />
              <div className="category-overlay" />
              <span className="category-badge">Effortless City Drive</span>
            </div>
            <div className="category-info">
              <h3 className="category-name">Urban Compacts & City Cars</h3>
              <p className="category-desc">Maruti Suzuki Swift ZXi Plus. High agility, sharp dynamics, and effortless city parking.</p>
              <div className="category-footer">
                <span className="category-price">From ₹1,800/day</span>
                <span className="category-link-arrow">Explore →</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE RENTAL COST ESTIMATOR WIDGET
         ========================================================================= */}
      <section className="section-block">
        <div className="calculator-card">
          <div className="calc-left">
            <div className="sub-badge">TRANSPARENT PRICING ENGINE</div>
            <h2 className="calc-title">Interactive Rental Cost Estimator</h2>
            <p className="calc-desc">
              Calculate exact rental estimates with zero hidden charges. Includes comprehensive insurance, maintenance, and statutory GST.
            </p>

            {/* Category Selector Buttons */}
            <div className="calc-field-group">
              <label className="calc-field-label">1. Select Vehicle Class</label>
              <div className="calc-category-buttons">
                {Object.keys(rates).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`calc-cat-btn ${calcCategory === cat ? 'active' : ''}`}
                    onClick={() => setCalcCategory(cat)}
                  >
                    <span className="cat-btn-name">{cat}</span>
                    <span className="cat-btn-rate">₹{rates[cat].base}/d</span>
                  </button>
                ))}
              </div>
              <div className="calc-selected-model-text">
                Vehicle model: <strong>{currentRate.name}</strong>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="calc-field-group">
              <div className="slider-header">
                <label className="calc-field-label">2. Rental Duration</label>
                <span className="slider-value-pill">{calcDays} {calcDays === 1 ? 'Day' : 'Days'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={calcDays}
                onChange={(e) => setCalcDays(parseInt(e.target.value, 10))}
                className="duration-range-slider"
              />
              <div className="slider-ticks">
                <span>1 Day</span>
                <span>3 Days (10% OFF)</span>
                <span>7 Days (15% OFF)</span>
                <span>14 Days</span>
                <span>30 Days</span>
              </div>
            </div>

            {/* Add-on Options */}
            <div className="calc-field-group">
              <label className="calc-field-label">3. Optional Peace-of-Mind Add-ons</label>
              <div className="addons-list">
                <label className="addon-item">
                  <input
                    type="checkbox"
                    checked={insuranceWaiver}
                    onChange={(e) => setInsuranceWaiver(e.target.checked)}
                  />
                  <div>
                    <div className="addon-title">Zero-Depreciation Insurance Waiver (+₹350/day)</div>
                    <div className="addon-desc">Covers 100% accidental damage with zero deductible liability.</div>
                  </div>
                </label>

                <label className="addon-item">
                  <input
                    type="checkbox"
                    checked={airportDelivery}
                    onChange={(e) => setAirportDelivery(e.target.checked)}
                  />
                  <div>
                    <div className="addon-title">Airport Terminal Express Delivery (+₹600 flat)</div>
                    <div className="addon-desc">Vehicle parked and ready at terminal gate arrival with contactless unlock.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Computed Invoice Card */}
          <div className="calc-right">
            <div className="live-invoice-box">
              <div className="invoice-header">
                <h3 className="invoice-title">Live Estimate Summary</h3>
                <span className="instant-quote-pill">Guaranteed Price</span>
              </div>

              <div className="invoice-rows">
                <div className="invoice-row">
                  <span>Base Rental ({calcDays} days × ₹{currentRate.base})</span>
                  <span>{formatCurrency(baseTotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="invoice-row discount-row">
                    <span>Duration Discount ({discountPercent * 100}%)</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {insuranceWaiver && (
                  <div className="invoice-row">
                    <span>Zero-Depreciation Cover</span>
                    <span>{formatCurrency(insuranceCost)}</span>
                  </div>
                )}

                {airportDelivery && (
                  <div className="invoice-row">
                    <span>Airport Express Delivery</span>
                    <span>{formatCurrency(deliveryCost)}</span>
                  </div>
                )}

                <div className="invoice-row">
                  <span>Statutory GST (18%)</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>

                <div className="invoice-divider" />

                <div className="invoice-row total-row">
                  <div>
                    <div className="grand-total-label">Total Estimated Amount</div>
                    <div className="grand-total-sub">Includes all taxes, maintenance & insurance</div>
                  </div>
                  <div className="grand-total-amount">
                    {formatCurrency(grandTotal)}
                  </div>
                </div>
              </div>

              <div className="invoice-action">
                <Link
                  to={`/vehicles?category=${calcCategory}`}
                  className="btn btn-primary btn-lg btn-full btn-shimmer"
                >
                  Browse Available {calcCategory}s →
                </Link>
                <div className="instant-refund-guarantee">
                  <ShieldCheckIcon size={16} color="#10b981" /> Free cancellation up to 6 hours prior
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE SMARTFLEET STANDARD: 4 PILLARS
         ========================================================================= */}
      <section className="section-block">
        <div className="section-header-centered">
          <div className="sub-badge">UNCOMPROMISING EXCELLENCE</div>
          <h2 className="section-title">The SmartFleet Standard</h2>
          <p className="section-description">
            Why corporate executives and discerning travelers choose our mobility infrastructure.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card card-hover">
            <div className="pillar-icon-box bg-blue">
              <ShieldCheckIcon size={28} color="#0D9488" />
            </div>
            <h3 className="pillar-title">150-Point Multi-Check</h3>
            <p className="pillar-text">
              Every engine, brake system, tire tread, and cabin filter is digitally inspected and sanitized before every handover.
            </p>
          </div>

          <div className="pillar-card card-hover">
            <div className="pillar-icon-box bg-amber">
              <ZapIcon size={28} color="#f59e0b" />
            </div>
            <h3 className="pillar-title">Instant Digital Keyless Unlock</h3>
            <p className="pillar-text">
              No counter queues or paperwork. Scan the vehicle QR, enter your authenticated OTP, and drive off in seconds.
            </p>
          </div>

          <div className="pillar-card card-hover">
            <div className="pillar-icon-box bg-emerald">
              <CreditCardIcon size={28} color="#10b981" />
            </div>
            <h3 className="pillar-title">Razorpay Secure Checkout</h3>
            <p className="pillar-text">
              Instant cryptographically verified payments with zero security deposits and automated refund processing within minutes.
            </p>
          </div>

          <div className="pillar-card card-hover">
            <div className="pillar-icon-box bg-indigo">
              <KeyIcon size={28} color="#6366f1" />
            </div>
            <h3 className="pillar-title">24/7 Roadside Telematics</h3>
            <p className="pillar-text">
              Every car features active IoT telematics with live SOS support and pan-India roadside breakdown concierge.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS: 4-STEP JOURNEY
         ========================================================================= */}
      <section className="section-block">
        <div className="section-header-centered">
          <div className="sub-badge">FRICTIONLESS PROCESS</div>
          <h2 className="section-title">How SmartFleet Works in 4 Simple Steps</h2>
          <p className="section-description">
            From booking to open road in under 5 minutes.
          </p>
        </div>

        <div className="timeline-steps">
          <div className="timeline-step">
            <div className="step-circle">01</div>
            <h4 className="step-title">Select Your Vehicle</h4>
            <p className="step-desc">Browse our curated fleet with real-time verified availability and pricing.</p>
          </div>

          <div className="timeline-step">
            <div className="step-circle">02</div>
            <h4 className="step-title">2-Min Digital KYC</h4>
            <p className="step-desc">Upload your driving license and ID once for encrypted instant validation.</p>
          </div>

          <div className="timeline-step">
            <div className="step-circle">03</div>
            <h4 className="step-title">Razorpay Checkout</h4>
            <p className="step-desc">Secure online payment with UPI, cards, or NetBanking with instant voucher generation.</p>
          </div>

          <div className="timeline-step">
            <div className="step-circle">04</div>
            <h4 className="step-title">Contactless Handover</h4>
            <p className="step-desc">Unlock vehicle via digital code and enjoy unlimited freedom on your journey.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          VERIFIED EXECUTIVE TESTIMONIALS
         ========================================================================= */}
      <section className="section-block">
        <div className="section-header-centered">
          <div className="sub-badge">CLIENT STORIES</div>
          <h2 className="section-title">Trusted by Thousands of Drivers</h2>
          <p className="section-description">
            Hear from executive travelers, tech leaders, and holiday road-trippers across India.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card card-hover">
            <div className="testimonial-rating">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={16} />
              ))}
            </div>
            <p className="testimonial-quote">
              "SmartFleet is by far the cleanest rental service in Bengaluru. The BMW 330i was delivered straight to the BLR terminal gate, spotlessly cleaned with full tank. Zero friction."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">AK</div>
              <div>
                <div className="author-name">Aditya Krishnan</div>
                <div className="author-role">VP Product • SaaS Founder, Bengaluru</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card card-hover">
            <div className="testimonial-rating">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={16} />
              ))}
            </div>
            <p className="testimonial-quote">
              "Rented a Tata Nexon EV for a 4-day Goa holiday. The transparent pricing and zero deposit policy is an absolute gamechanger compared to traditional chaotic car rentals."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar bg-purple">PV</div>
              <div>
                <div className="author-name">Pooja Varma</div>
                <div className="author-role">Director of Strategy • Deloitte Mumbai</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card card-hover">
            <div className="testimonial-rating">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={16} />
              ))}
            </div>
            <p className="testimonial-quote">
              "SmartFleet made my Chennai to Pondicherry road trip effortless. The Mahindra Thar ROXX was delivered right to Chennai MAA Airport on time. Seamless digital booking and zero hassle."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar bg-amber">KS</div>
              <div>
                <div className="author-name">Karthik Sundaram</div>
                <div className="author-role">Director of Engineering • Tech Parks OMR, Chennai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERSION CTA BANNER
         ========================================================================= */}
      <section className="cta-banner">
        <div className="cta-content">
          <div className="cta-badge">EXPERIENCE PREMIUM MOBILITY</div>
          <h2 className="cta-heading">Ready to Take the Driver's Seat?</h2>
          <p className="cta-text">
            Join thousands of satisfied business professionals and travelers enjoying flawless self-drive experiences.
          </p>
          <div className="cta-button-group">
            <Link to="/vehicles" className="btn btn-primary btn-lg btn-shimmer">
              Explore Available Fleet →
            </Link>
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn btn-secondary btn-lg">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
