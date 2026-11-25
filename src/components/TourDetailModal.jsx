import { useEffect, useState } from 'react';
import { addReview, getGalleryForTour, getReviews, getTransitForTour } from '../lib/storage.js';
import { CheckIcon, ClockIcon, HeartIcon, MapPinIcon, StarIcon, UsersIcon } from './Icons.jsx';

export default function TourDetailModal({
  tour,
  user,
  isWishlisted = false,
  onToggleWishlist,
  onClose,
  onBook,
}) {
  const [reviews, setReviews] = useState(() => getReviews(tour.id));
  const [activeSection, setActiveSection] = useState('overview');
  const gallery = getGalleryForTour(tour);
  const [activePhoto, setActivePhoto] = useState(gallery[0]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const transit = getTransitForTour(tour);

  useEffect(() => {
    setReviews(getReviews(tour.id));
    setActiveSection('overview');
    setActivePhoto(getGalleryForTour(tour)[0]);
  }, [tour.id]);

  function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewError('');
    try {
      const created = addReview({
        tourId: tour.id,
        userName: user?.name || 'Guest Traveller',
        rating,
        comment,
      });
      setReviews((prev) => [created, ...prev]);
      setComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err.message);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="modal-close detail-close" type="button" onClick={onClose} aria-label="Close package details">
          ×
        </button>

        <div className="detail-hero">
          <img src={activePhoto || tour.image} alt={tour.title} />
          <div className="detail-hero-overlay">
            <span className="tour-category">{tour.category}</span>
            {onToggleWishlist && (
              <button
                type="button"
                className={`wishlist-btn detail-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={() => onToggleWishlist(tour.id)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <HeartIcon filled={isWishlisted} />
              </button>
            )}
          </div>
        </div>

        <div className="detail-gallery-strip">
          {gallery.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              className={`gallery-thumb ${activePhoto === imgUrl ? 'active' : ''}`}
              onClick={() => setActivePhoto(imgUrl)}
              aria-label={`View photo ${idx + 1}`}
            >
              <img src={imgUrl} alt={`${tour.title} view ${idx + 1}`} />
            </button>
          ))}
        </div>

        <div className="detail-body">
          <div className="detail-header">
            <div>
              <div className="tour-location">
                <MapPinIcon /> {tour.location}
              </div>
              <h2 id="detail-title">{tour.title}</h2>
              <p className="detail-desc">{tour.description}</p>
            </div>
            <div className="detail-price-box">
              <small>PER PERSON</small>
              <strong>₹{Number(tour.price).toLocaleString('en-IN')}</strong>
              <span className="rating-badge">
                <StarIcon /> {tour.rating || 4.8} ({tour.reviewCount || reviews.length})
              </span>
            </div>
          </div>

          <div className="detail-meta-strip">
            <span><ClockIcon /> {tour.duration}</span>
            <span><UsersIcon /> {tour.groupSize || 'Up to 8'} travellers</span>
            <span>Pace: <strong>{tour.difficulty || 'Easy'}</strong></span>
            <span>Economy Transit: <strong>{transit.economyCost}</strong></span>
          </div>

          <div className="eco-meter-strip">
            <span>🌿 <strong>Eco-Transit:</strong> Saves ~68% CO₂ vs solo driving/flying</span>
            <span>🌤 <strong>Best Window:</strong> Oct – Mar · <b>Balanced Crowd</b></span>
          </div>

          <div className="detail-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'overview'}
              className={`dash-tab ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              Itinerary &amp; Highlights
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'transit'}
              className={`dash-tab ${activeSection === 'transit' ? 'active' : ''}`}
              onClick={() => setActiveSection('transit')}
            >
              Economy &amp; Transit Routes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'reviews'}
              className={`dash-tab ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveSection('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {activeSection === 'overview' && (
            <>
              <div className="detail-columns">
                <div className="detail-block">
                  <div className="eyebrow dark-eyebrow">EXPERIENCE HIGHLIGHTS</div>
                  <ul className="check-list">
                    {(tour.highlights || []).map((item, idx) => (
                      <li key={idx}><CheckIcon /> <span>{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="detail-block">
                  <div className="eyebrow dark-eyebrow">WHAT’S INCLUDED</div>
                  <ul className="check-list">
                    {(tour.inclusions || []).map((item, idx) => (
                      <li key={idx}><CheckIcon /> <span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="detail-block">
                <div className="eyebrow dark-eyebrow">DAY-BY-DAY ITINERARY</div>
                <div className="itinerary-list">
                  {(tour.itinerary || []).map((step, idx) => (
                    <div className="itinerary-item" key={idx}>
                      <span className="itinerary-day">{step.day}</span>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'transit' && (
            <div className="transit-panel">
              <div className="economy-banner">
                <div>
                  <div className="eyebrow dark-eyebrow">BEST ECONOMY MODE OF TRANSPORT</div>
                  <strong>{transit.bestEconomyMode}</strong>
                </div>
                <span className="economy-cost-pill">Est. {transit.economyCost}</span>
              </div>

              <div className="transit-grid">
                <div className="transit-card">
                  <div className="transit-card-head">
                    <strong>✈ Airport Route</strong>
                    <span>{transit.airport.distance} · {transit.airport.time}</span>
                  </div>
                  <small className="transit-hub">{transit.airport.name}</small>
                  <p><b>Fastest:</b> {transit.airport.fastRoute}</p>
                  <p><b>Economy:</b> {transit.airport.economyRoute}</p>
                </div>

                <div className="transit-card">
                  <div className="transit-card-head">
                    <strong>🚆 Railway Station</strong>
                    <span>{transit.railway.distance} · {transit.railway.time}</span>
                  </div>
                  <small className="transit-hub">{transit.railway.name}</small>
                  <p><b>Fastest:</b> {transit.railway.fastRoute}</p>
                  <p><b>Economy:</b> {transit.railway.economyRoute}</p>
                </div>

                <div className="transit-card">
                  <div className="transit-card-head">
                    <strong>🚌 Bus Station</strong>
                    <span>{transit.busStation.distance} · {transit.busStation.time}</span>
                  </div>
                  <small className="transit-hub">{transit.busStation.name}</small>
                  <p><b>Fastest:</b> {transit.busStation.fastRoute}</p>
                  <p><b>Economy:</b> {transit.busStation.economyRoute}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reviews' && (
            <div className="detail-block">
              <div className="eyebrow dark-eyebrow">TRAVELLER REVIEWS ({reviews.length})</div>
              {reviews.length === 0 ? (
                <p className="muted-copy">No reviews yet. Be the first to share your experience!</p>
              ) : (
                <div className="review-list">
                  {reviews.map((rev) => (
                    <div className="review-card" key={rev.id}>
                      <div className="review-head">
                        <strong>{rev.userName}</strong>
                        <span className="rating-badge"><StarIcon /> {rev.rating}.0</span>
                      </div>
                      <p>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <form className="inline-review-form" onSubmit={handleReviewSubmit}>
                  <div className="inline-review-row">
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} aria-label="Rating">
                      <option value={5}>5 ★ — Exceptional</option>
                      <option value={4}>4 ★ — Great</option>
                      <option value={3}>3 ★ — Good</option>
                      <option value={2}>2 ★ — Fair</option>
                      <option value={1}>1 ★ — Needs work</option>
                    </select>
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share a quick note about this trip..."
                    />
                    <button className="button button-quiet button-small" type="submit">Post review</button>
                  </div>
                  {reviewError && <div className="form-error">{reviewError}</div>}
                </form>
              )}
            </div>
          )}

          <div className="detail-footer">
            <div>
              <small>Free cancellation up to 7 days prior</small>
              <strong>₹{Number(tour.price).toLocaleString('en-IN')} / guest</strong>
            </div>
            <button className="button button-dark" type="button" onClick={() => onBook(tour)}>
              {user ? 'Book this journey' : 'Sign in to book'} <span>↗</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
