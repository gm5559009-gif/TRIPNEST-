import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clearUserPreset,
  createInquiry,
  getReviews,
  getTours,
  getTransitForTour,
  getUserPreset,
  getWishlist,
  saveUserPreset,
  subscribeToStore,
  toggleWishlist,
} from '../lib/storage.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  CompassIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  StarIcon,
} from '../components/Icons.jsx';
import TourDetailModal from '../components/TourDetailModal.jsx';
import BookingModal from '../components/BookingModal.jsx';
import TripMatcherModal from '../components/TripMatcherModal.jsx';
import CompareModal from '../components/CompareModal.jsx';
import SplitCalculatorModal from '../components/SplitCalculatorModal.jsx';

const CATEGORIES = ['All', 'Nature', 'Beach', 'Culture', 'Adventure', 'City'];
const PACES = ['All', 'Easy', 'Moderate', 'Challenging'];
const TRANSIT_MODES = [
  { id: 'All', label: 'Any Transit Hub' },
  { id: 'airport', label: 'Best via Airport' },
  { id: 'railway', label: 'Best via Railway' },
  { id: 'bus', label: 'Best via Bus / Road' },
];

const FAQS = [
  {
    q: 'How do instant e-tickets and confirmations work?',
    a: 'As soon as you submit a booking request, TripNest generates a digital e-ticket pass with your booking ID. Our concierge team confirms availability within minutes.',
  },
  {
    q: 'Can I cancel or reschedule a pending booking?',
    a: 'Yes! From your Traveller Dashboard, any booking in Pending status can be cancelled in one click, and confirmed trips enjoy free rescheduling up to 7 days before departure.',
  },
  {
    q: 'How does the Saved Travel Preset work?',
    a: 'Save your preferred category, pace, max budget, and transit preference in the left sidebar. TripNest remembers your profile before your trip and automatically ranks the best-matching destinations first.',
  },
  {
    q: 'Does every destination include economy transport routes?',
    a: 'Yes! Click Itinerary & Transit on any destination to view the most economical transport mode plus fastest and budget routes from the nearest Airport, Railway Station, and Bus Depot.',
  },
];

function computePresetScore(tour, preset) {
  if (!preset) return 0;
  let score = 60;
  if (preset.category === 'All' || preset.category === tour.category) score += 18;
  if (preset.pace === 'All' || (tour.difficulty || 'Easy') === preset.pace) score += 12;
  if (Number(tour.price) <= Number(preset.maxBudget || 20000)) score += 10;
  else score -= 12;
  return Math.min(99, Math.max(55, score));
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tours, setTours] = useState(() => getTours());
  const [reviews, setReviews] = useState(() => getReviews());
  const [wishlist, setWishlist] = useState(() => getWishlist(user?.id));
  const [savedPreset, setSavedPreset] = useState(() => getUserPreset(user?.id));
  const [heroIndex, setHeroIndex] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(() => savedPreset?.category || 'All');
  const [pace, setPace] = useState(() => savedPreset?.pace || 'All');
  const [maxBudget, setMaxBudget] = useState(() => savedPreset?.maxBudget || 20000);
  const [transitFilter, setTransitFilter] = useState(() => savedPreset?.transitMode || 'All');
  const [sortBy, setSortBy] = useState(() => (savedPreset ? 'preset' : 'recommended'));

  const [detailTour, setDetailTour] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMatcher, setShowMatcher] = useState(false);
  const [showSplitCalc, setShowSplitCalc] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [notice, setNotice] = useState('');

  const [inquiryForm, setInquiryForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    destination: '',
    travelers: '2',
    budget: '₹10,000 – ₹20,000 / person',
    preferredMonth: '',
    notes: '',
  });
  const [inquiryStatus, setInquiryStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    return subscribeToStore(() => {
      setTours(getTours());
      setReviews(getReviews());
      setWishlist(getWishlist(user?.id));
      setSavedPreset(getUserPreset(user?.id));
    });
  }, [user?.id]);

  useEffect(() => {
    setWishlist(getWishlist(user?.id));
    const preset = getUserPreset(user?.id);
    setSavedPreset(preset);
    if (preset) {
      setCategory(preset.category || 'All');
      setPace(preset.pace || 'All');
      setMaxBudget(preset.maxBudget || 20000);
      setTransitFilter(preset.transitMode || 'All');
      setSortBy('preset');
    }
  }, [user?.id]);

  const heroTours = useMemo(() => tours.slice(0, 4), [tours]);
  const activeHero = heroTours[heroIndex % Math.max(1, heroTours.length)] || tours[0];

  const filteredTours = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tours
      .map((tour) => ({
        ...tour,
        transit: getTransitForTour(tour),
        presetScore: computePresetScore(tour, savedPreset),
      }))
      .filter((tour) => {
        const matchesCategory = category === 'All' || tour.category === category;
        const matchesPace = pace === 'All' || (tour.difficulty || 'Easy') === pace;
        const matchesBudget = Number(tour.price) <= Number(maxBudget);
        const matchesQuery =
          !q ||
          tour.title.toLowerCase().includes(q) ||
          tour.location.toLowerCase().includes(q) ||
          tour.description.toLowerCase().includes(q);
        const modeText = `${tour.transit.bestEconomyMode} ${tour.transit.railway?.name}`.toLowerCase();
        const matchesTransit =
          transitFilter === 'All' ||
          (transitFilter === 'airport' && !tour.transit.airport.name.includes('No')) ||
          (transitFilter === 'railway' && !tour.transit.railway.name.includes('No Rail')) ||
          (transitFilter === 'bus' && (modeText.includes('bus') || modeText.includes('shuttle') || modeText.includes('taxi')));
        return matchesCategory && matchesPace && matchesBudget && matchesQuery && matchesTransit;
      });

    if (sortBy === 'preset' && savedPreset) return [...list].sort((a, b) => b.presetScore - a.presetScore);
    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [tours, search, category, pace, maxBudget, transitFilter, sortBy, savedPreset]);

  function handleSavePreset() {
    const next = saveUserPreset(user?.id, {
      category,
      pace,
      maxBudget: Number(maxBudget),
      transitMode: transitFilter,
    });
    setSavedPreset(next);
    setSortBy('preset');
    setNotice('Travel preset saved! Showing your best-matched destinations first.');
  }

  function handleResetFilters() {
    setSearch('');
    setCategory('All');
    setPace('All');
    setMaxBudget(20000);
    setTransitFilter('All');
    setSortBy('recommended');
  }

  function handleClearPreset() {
    clearUserPreset(user?.id);
    setSavedPreset(null);
    handleResetFilters();
    setNotice('Saved travel preset cleared.');
  }

  function handleWishlist(tourId) {
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlist(toggleWishlist(user.id, tourId));
  }

  function handleToggleCompare(tourId) {
    setCompareIds((prev) => {
      if (prev.includes(tourId)) return prev.filter((id) => id !== tourId);
      if (prev.length >= 3) {
        setNotice('You can compare up to 3 journeys at a time.');
        return prev;
      }
      return [...prev, tourId];
    });
  }

  const compareTours = useMemo(
    () => tours.filter((t) => compareIds.includes(t.id)),
    [tours, compareIds],
  );

  function handleStartBooking(tour) {
    setDetailTour(null);
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingTour(tour);
  }

  function handleInquirySubmit(event) {
    event.preventDefault();
    setInquiryStatus({ error: '', success: '' });
    try {
      const saved = createInquiry(inquiryForm);
      setInquiryStatus({
        error: '',
        success: `Request ${saved.id} received! Our concierge team will respond with a tailored itinerary.`,
      });
      setInquiryForm((prev) => ({ ...prev, destination: '', preferredMonth: '', notes: '' }));
    } catch (err) {
      setInquiryStatus({ error: err.message, success: '' });
    }
  }

  return (
    <>
      {notice && (
        <div className="floating-toast" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss">×</button>
        </div>
      )}

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h1>
            Go beyond<br />
            <em>the ordinary.</em>
          </h1>
          <p>
            Handpicked escapes, economy transit routes, personalized trip presets, and instant e-tickets built for effortless travel.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#destinations">
              Explore journeys <span>↗</span>
            </a>
            <button
              type="button"
              className="button button-outline-light"
              onClick={() => setShowMatcher(true)}
            >
              <SparkleIcon size={14} /> TripVibe Matcher
            </button>
            <button
              type="button"
              className="button button-outline-light"
              onClick={() => setShowSplitCalc(true)}
            >
              Split Calculator
            </button>
          </div>
          <div className="hero-note">
            <span className="hero-note-line" /> Curated escapes across India · Free 7-day rescheduling
          </div>
        </div>

        <div className="hero-visual">
          <img
            src={
              activeHero?.image ||
              'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=90'
            }
            alt={activeHero?.title || 'Mountain valley at golden hour'}
          />
          {activeHero && (
            <button
              type="button"
              className="floating-card"
              onClick={() => setDetailTour(activeHero)}
            >
              <span className="floating-card-label">FEATURED ESCAPE</span>
              <strong>{activeHero.title}</strong>
              <small>From ₹{Number(activeHero.price).toLocaleString('en-IN')}</small>
              <span className="floating-card-arrow">↗</span>
            </button>
          )}
          {heroTours.length > 1 && (
            <div className="hero-carousel-controls">
              <button
                type="button"
                aria-label="Previous destination"
                onClick={() => setHeroIndex((prev) => (prev - 1 + heroTours.length) % heroTours.length)}
              >
                ←
              </button>
              <div className="hero-index">
                {String((heroIndex % heroTours.length) + 1).padStart(2, '0')} <span>/</span>{' '}
                {String(heroTours.length).padStart(2, '0')}
              </div>
              <button
                type="button"
                aria-label="Next destination"
                onClick={() => setHeroIndex((prev) => (prev + 1) % heroTours.length)}
              >
                →
              </button>
            </div>
          )}
        </div>
        <div className="hero-bottom">
          <span>01 — DISCOVER</span>
          <span>02 — TRANSIT &amp; PLAN</span>
          <span>03 — REMEMBER</span>
        </div>
      </section>

      <section className="trust-strip">
        <div className="trust-item">
          <CompassIcon />
          <div>
            <strong>Economy &amp; Fast Transit Routes</strong>
            <span>Every destination shows Airport, Railway &amp; Bus routes with budget estimates.</span>
          </div>
        </div>
        <div className="trust-item">
          <ShieldIcon />
          <div>
            <strong>Saved Pre-Trip Presets</strong>
            <span>Save your pace, budget &amp; transit preference to surface best-fit trips first.</span>
          </div>
        </div>
        <div className="trust-item">
          <SparkleIcon />
          <div>
            <strong>Instant E-Tickets &amp; Split-Bill</strong>
            <span>Live per-person cost splits, add-ons, and smart destination packing lists.</span>
          </div>
        </div>
      </section>

      <section className="section destinations" id="destinations">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">THE COLLECTION</div>
            <h2>
              Places worth<br />
              <em>pausing for.</em>
            </h2>
          </div>
          <p>Tap the 3-dot menu to open filters &amp; your saved pre-trip preset, or inspect economy transit routes on any journey.</p>
        </div>

        <div className="collection-topbar">
          <button
            type="button"
            className="three-dots-trigger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open filters and travel preset sidebar"
          >
            <span className="dots-glyph" aria-hidden="true">⋮</span>
            <span>Filters &amp; Travel Preset</span>
            {savedPreset && <span className="preset-active-pill">Preset On</span>}
          </button>

          <div className="search-input-wrap topbar-search">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Quick search city, state, or vibe..."
              aria-label="Quick search places"
            />
          </div>

          <button
            type="button"
            className="button button-quiet button-small"
            onClick={() => setShowSplitCalc(true)}
          >
            Group Split Calculator
          </button>

          <div className="results-bar">
            <span>
              <strong>{filteredTours.length}</strong> of {tours.length} places
              {savedPreset ? ' · Ranked by preset' : ''}
            </span>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="drawer-backdrop"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSidebarOpen(false);
            }}
          >
            <aside className="filter-drawer" aria-label="Destination filters and travel preset">
              <div className="drawer-header">
                <div>
                  <div className="eyebrow dark-eyebrow">FILTER STUDIO</div>
                  <h3>Refine &amp; <em>Preset</em></h3>
                </div>
                <button
                  type="button"
                  className="modal-close drawer-close"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close filter sidebar"
                >
                  ×
                </button>
              </div>

              <div className="preset-box">
                <div className="preset-head">
                  <div className="eyebrow dark-eyebrow">MY PRE-TRIP PRESET</div>
                  {savedPreset && <span className="preset-active-pill">Saved</span>}
                </div>
                <p className="preset-sub">
                  {savedPreset
                    ? `Active: ${savedPreset.category} · ${savedPreset.pace} · ≤₹${Number(savedPreset.maxBudget).toLocaleString('en-IN')}`
                    : 'Save your travel style to rank best-fit destinations automatically.'}
                </p>
                <div className="preset-actions">
                  <button type="button" className="button button-dark button-xs" onClick={handleSavePreset}>
                    {savedPreset ? 'Update Preset' : 'Save My Preset'}
                  </button>
                  {savedPreset && (
                    <button type="button" className="button button-quiet button-xs" onClick={handleClearPreset}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="sidebar-group">
                <label className="sidebar-label" htmlFor="place-search">Search Place</label>
                <div className="search-input-wrap">
                  <SearchIcon />
                  <input
                    id="place-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="City, state, vibe (e.g. Coorg, Goa, Beach)..."
                  />
                </div>
              </div>

              <div className="drawer-results-box">
                <div className="drawer-results-head">
                  <span className="sidebar-label">
                    {search.trim() ? `Search Results (${filteredTours.length})` : `Recommended Places (${filteredTours.length})`}
                  </span>
                </div>
                {filteredTours.length === 0 ? (
                  <p className="drawer-no-results">No places match "{search}". Try Kerala, Jaipur, Coorg, or Beach.</p>
                ) : (
                  <div className="drawer-results-list">
                    {filteredTours.slice(0, 5).map((tour) => (
                      <button
                        key={tour.id}
                        type="button"
                        className="drawer-result-card"
                        onClick={() => {
                          setSidebarOpen(false);
                          setDetailTour(tour);
                        }}
                      >
                        <img src={tour.image} alt={tour.title} />
                        <div className="drawer-result-info">
                          <strong>{tour.title}</strong>
                          <span>{tour.location} · ₹{Number(tour.price).toLocaleString('en-IN')}</span>
                          {savedPreset && <small>{tour.presetScore}% Preset Match</small>}
                        </div>
                        <span className="drawer-result-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="sidebar-group">
                <span className="sidebar-label">Category</span>
                <div className="category-pills">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`category-pill ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-group">
                <div className="range-head">
                  <span className="sidebar-label">Max Budget / Guest</span>
                  <strong>₹{Number(maxBudget).toLocaleString('en-IN')}</strong>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="20000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="budget-slider"
                />
              </div>

              <div className="sidebar-group">
                <span className="sidebar-label">Trip Pace</span>
                <div className="category-pills">
                  {PACES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`category-pill ${pace === p ? 'active' : ''}`}
                      onClick={() => setPace(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-group">
                <label className="sidebar-label" htmlFor="transit-filter">Preferred Transit Hub</label>
                <select
                  id="transit-filter"
                  className="sort-select full-select"
                  value={transitFilter}
                  onChange={(e) => setTransitFilter(e.target.value)}
                >
                  {TRANSIT_MODES.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="sidebar-group">
                <label className="sidebar-label" htmlFor="sort-filter">Sort Results</label>
                <select
                  id="sort-filter"
                  className="sort-select full-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {savedPreset && <option value="preset">Best Match for Your Preset</option>}
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <div className="drawer-footer-actions">
                <button type="button" className="button button-quiet button-small" onClick={handleResetFilters}>
                  Reset
                </button>
                <button type="button" className="button button-dark button-small" onClick={() => setSidebarOpen(false)}>
                  Show {filteredTours.length} places ↗
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="explore-main">
          {filteredTours.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>No journeys match your current filters.</h3>
              <p>Tap the 3-dot filter button to adjust your budget or reset filters.</p>
            </div>
          ) : (
            <div className="tour-grid">
              {filteredTours.map((tour, index) => {
                const saved = wishlist.includes(tour.id);
                return (
                  <article className="tour-card" key={tour.id}>
                    <div className="tour-image-wrap" onClick={() => setDetailTour(tour)}>
                      <img
                        src={tour.image}
                        alt={tour.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                      <span className="tour-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="tour-category">{tour.category}</span>
                      {savedPreset && (
                        <span className="preset-match-badge">{tour.presetScore}% Match</span>
                      )}
                      <button
                        type="button"
                        className={`wishlist-btn ${saved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist(tour.id);
                        }}
                        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <HeartIcon filled={saved} />
                      </button>
                    </div>
                    <div className="tour-card-body">
                      <div className="tour-meta-row">
                        <span className="tour-location">
                          <MapPinIcon /> {tour.location}
                        </span>
                        <span className="rating-badge">
                          <StarIcon /> {tour.rating || 4.8}
                        </span>
                      </div>
                      <h3 onClick={() => setDetailTour(tour)} className="clickable-title">
                        {tour.title}
                      </h3>
                      <p>{tour.description}</p>
                      <div className="economy-chip">
                        Best Economy: <strong>{tour.transit.bestEconomyMode}</strong> ({tour.transit.economyCost})
                      </div>
                      <div className="tour-card-bottom">
                        <div>
                          <small>{tour.duration}</small>
                          <strong>₹{Number(tour.price).toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="card-cta-pair">
                          <button
                            type="button"
                            className={`button button-xs ${compareIds.includes(tour.id) ? 'button-dark' : 'button-quiet'}`}
                            onClick={() => handleToggleCompare(tour.id)}
                          >
                            {compareIds.includes(tour.id) ? '✓' : '+ Compare'}
                          </button>
                          <button
                            type="button"
                            className="button button-quiet button-xs"
                            onClick={() => setDetailTour(tour)}
                          >
                            Routes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartBooking(tour)}
                            className="round-arrow"
                            aria-label={`Book ${tour.title}`}
                          >
                            ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section visual-mosaic-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">VISUAL POSTCARDS</div>
            <h2>
              Snapshots from<br />
              <em>around India.</em>
            </h2>
          </div>
          <p>Click any destination card above to explore its full multi-photo gallery.</p>
        </div>
        <div className="mosaic-grid">
          <figure className="mosaic-tile mosaic-tall" onClick={() => setDetailTour(tours[0])}>
            <img src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=85" alt="Kerala Backwaters" />
            <figcaption>Kerala Backwaters &amp; Tea Hills</figcaption>
          </figure>
          <figure className="mosaic-tile" onClick={() => setDetailTour(tours[2])}>
            <img src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=85" alt="Jaipur Heritage Palace" />
            <figcaption>Jaipur Royal Heritage</figcaption>
          </figure>
          <figure className="mosaic-tile" onClick={() => setDetailTour(tours[4])}>
            <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=85" alt="Ladakh Mountain Passes" />
            <figcaption>Ladakh High Passes</figcaption>
          </figure>
          <figure className="mosaic-tile" onClick={() => setDetailTour(tours[7])}>
            <img src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=900&q=85" alt="Andaman Turquoise Coast" />
            <figcaption>Andaman Coral Coves</figcaption>
          </figure>
          <figure className="mosaic-tile" onClick={() => setDetailTour(tours[5])}>
            <img src="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=85" alt="Udaipur Lakefront" />
            <figcaption>Udaipur Lake Serenity</figcaption>
          </figure>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">TRAVELLER STORIES</div>
            <h2>
              Loved by those<br />
              <em>who went.</em>
            </h2>
          </div>
          <p>Verified notes from recent TripNest departures.</p>
        </div>
        <div className="testimonials-grid">
          {reviews.slice(0, 3).map((rev) => (
            <article className="testimonial-card" key={rev.id}>
              <div className="rating-badge">
                <StarIcon /> {rev.rating}.0 / 5.0
              </div>
              <p>“{rev.comment}”</p>
              <strong>{rev.userName}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section concierge-section" id="concierge">
        <div className="concierge-card">
          <div className="concierge-copy">
            <div className="eyebrow">BESPOKE CONCIERGE</div>
            <h2>
              Dreaming of somewhere<br />
              <em>not on the list?</em>
            </h2>
            <p>
              Tell our travel designers where you want to go, your group size, and your budget. We’ll send a custom route within 24 hours.
            </p>
            <div className="concierge-perks">
              <span>✓ Handpicked boutique stays</span>
              <span>✓ Economy &amp; express transit planning</span>
              <span>✓ Custom pace for families or solo travellers</span>
            </div>
          </div>
          <form className="concierge-form" onSubmit={handleInquirySubmit}>
            <div className="form-row-2">
              <label>
                Your name
                <input
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  placeholder="Aarav Kapoor"
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>
            <div className="form-row-2">
              <label>
                Desired destination
                <input
                  value={inquiryForm.destination}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, destination: e.target.value })}
                  placeholder="e.g. Spiti Valley, Coorg, Meghalaya"
                  required
                />
              </label>
              <label>
                Preferred month
                <input
                  value={inquiryForm.preferredMonth}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, preferredMonth: e.target.value })}
                  placeholder="e.g. March 2027"
                />
              </label>
            </div>
            <div className="form-row-2">
              <label>
                Travellers
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={inquiryForm.travelers}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, travelers: e.target.value })}
                />
              </label>
              <label>
                Budget range
                <select
                  value={inquiryForm.budget}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, budget: e.target.value })}
                >
                  <option>Under ₹10,000 / person</option>
                  <option>₹10,000 – ₹20,000 / person</option>
                  <option>₹20,000 – ₹40,000 / person</option>
                  <option>Luxury (₹40,000+ / person)</option>
                </select>
              </label>
            </div>
            <label>
              Trip notes
              <textarea
                rows="2"
                value={inquiryForm.notes}
                onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                placeholder="Tell us about the vibe, pace, or special occasion..."
              />
            </label>
            {inquiryStatus.error && <div className="form-error">{inquiryStatus.error}</div>}
            {inquiryStatus.success && <div className="promo-success">{inquiryStatus.success}</div>}
            <button className="button button-light form-submit" type="submit">
              Request custom itinerary <span>↗</span>
            </button>
          </form>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">GOOD TO KNOW</div>
            <h2>
              Frequently asked<br />
              <em>questions.</em>
            </h2>
          </div>
        </div>
        <div className="faq-list">
          {FAQS.map((item, idx) => (
            <div className={`faq-item ${openFaq === idx ? 'open' : ''}`} key={idx}>
              <button
                type="button"
                className="faq-trigger"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                aria-expanded={openFaq === idx}
              >
                <span>{item.q}</span>
                <span>{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <div className="eyebrow">YOUR JOURNEY, YOUR WAY</div>
          <h2>
            Ready to make<br />
            <em>some memories?</em>
          </h2>
        </div>
        <Link className="button button-light" to={user ? (user.role === 'admin' ? '/admin' : '/user') : '/signup'}>
          Start planning <span>↗</span>
        </Link>
      </section>

      {detailTour && (
        <TourDetailModal
          tour={detailTour}
          user={user}
          isWishlisted={wishlist.includes(detailTour.id)}
          onToggleWishlist={handleWishlist}
          onClose={() => setDetailTour(null)}
          onBook={handleStartBooking}
        />
      )}

      {bookingTour && user && (
        <BookingModal
          tour={bookingTour}
          user={user}
          onClose={() => setBookingTour(null)}
          onBooked={(b) => setNotice(`E-Ticket ${b.id} created for ${b.tourTitle}!`)}
        />
      )}

      {showMatcher && (
        <TripMatcherModal
          tours={tours}
          onClose={() => setShowMatcher(false)}
          onSelectTour={(tour) => {
            setShowMatcher(false);
            setDetailTour(tour);
          }}
          onBookTour={(tour) => {
            setShowMatcher(false);
            handleStartBooking(tour);
          }}
        />
      )}

      {showCompare && (
        <CompareModal
          tours={compareTours}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => handleToggleCompare(id)}
          onBookTour={(tour) => {
            setShowCompare(false);
            handleStartBooking(tour);
          }}
        />
      )}

      {showSplitCalc && (
        <SplitCalculatorModal
          tours={tours}
          initialTour={filteredTours[0] || tours[0]}
          onClose={() => setShowSplitCalc(false)}
          onBookTour={(tour) => {
            setShowSplitCalc(false);
            handleStartBooking(tour);
          }}
        />
      )}

      {compareTours.length > 0 && !showCompare && (
        <div className="compare-dock">
          <span>
            <strong>{compareTours.length}/3</strong> journeys selected
          </span>
          <div className="compare-dock-actions">
            <button type="button" className="button button-quiet button-xs" onClick={() => setCompareIds([])}>
              Clear
            </button>
            <button type="button" className="button button-light button-xs" onClick={() => setShowCompare(true)}>
              Compare side-by-side ↗
            </button>
          </div>
        </div>
      )}
    </>
  );
}
