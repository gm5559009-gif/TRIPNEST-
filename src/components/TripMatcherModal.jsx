import { useMemo, useState } from 'react';
import { MapPinIcon, SparkleIcon, StarIcon } from './Icons.jsx';

const PACE_OPTIONS = [
  { id: 'slow', label: 'Slow & Restorative', desc: 'Misty mornings, cafés, zero rush', categories: ['Nature', 'Beach'] },
  { id: 'cultural', label: 'Culture & Heritage', desc: 'Forts, palaces, local artisans & food', categories: ['Culture', 'City'] },
  { id: 'thrill', label: 'High-Altitude & Active', desc: 'Mountain passes, rafting, ridge hikes', categories: ['Adventure', 'Nature'] },
];

const LANDSCAPE_OPTIONS = [
  { id: 'mountains', label: 'Hills & Peaks', categories: ['Nature', 'Adventure'] },
  { id: 'coast', label: 'Beaches & Islands', categories: ['Beach'] },
  { id: 'royal', label: 'Palaces & Lakes', categories: ['Culture', 'City'] },
];

const BUDGET_OPTIONS = [
  { id: 'under8k', label: 'Under ₹8,000 / guest', max: 8000 },
  { id: 'mid', label: '₹8,000 – ₹12,000 / guest', max: 12000 },
  { id: 'any', label: 'Flexible / Luxury', max: 999999 },
];

export default function TripMatcherModal({ tours, onClose, onSelectTour, onBookTour }) {
  const [step, setStep] = useState(0);
  const [pace, setPace] = useState(PACE_OPTIONS[0]);
  const [landscape, setLandscape] = useState(LANDSCAPE_OPTIONS[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[1]);

  const matches = useMemo(() => {
    const scored = tours.map((tour) => {
      let score = 62;
      if (pace.categories.includes(tour.category)) score += 18;
      if (landscape.categories.includes(tour.category)) score += 14;
      if (tour.price <= budget.max) score += 6;
      else score -= 8;
      return { tour, score: Math.min(99, Math.max(70, score)) };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [tours, pace, landscape, budget]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="booking-modal matcher-modal" role="dialog" aria-modal="true" aria-labelledby="matcher-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close TripVibe Matcher">
          ×
        </button>

        <div className="matcher-badge">
          <SparkleIcon size={15} /> TRIPVIBE SMART MATCHER
        </div>
        <h2 id="matcher-title">
          {step < 3 ? (
            <>Find your <em>perfect escape.</em></>
          ) : (
            <>Your curated <em>top matches.</em></>
          )}
        </h2>

        {step < 3 && (
          <div className="matcher-progress">
            <div className="matcher-progress-fill" style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>
        )}

        {step === 0 && (
          <div className="matcher-step">
            <p className="matcher-q">1 of 3 · What pace are you craving right now?</p>
            <div className="matcher-options">
              {PACE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`matcher-option ${pace.id === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    setPace(opt);
                    setStep(1);
                  }}
                >
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="matcher-step">
            <p className="matcher-q">2 of 3 · Which backdrop feels right?</p>
            <div className="matcher-options">
              {LANDSCAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`matcher-option ${landscape.id === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    setLandscape(opt);
                    setStep(2);
                  }}
                >
                  <strong>{opt.label}</strong>
                </button>
              ))}
            </div>
            <button type="button" className="button button-quiet button-small matcher-back" onClick={() => setStep(0)}>
              ← Back
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="matcher-step">
            <p className="matcher-q">3 of 3 · Comfort budget per traveller?</p>
            <div className="matcher-options">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`matcher-option ${budget.id === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    setBudget(opt);
                    setStep(3);
                  }}
                >
                  <strong>{opt.label}</strong>
                </button>
              ))}
            </div>
            <button type="button" className="button button-quiet button-small matcher-back" onClick={() => setStep(1)}>
              ← Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="matcher-results">
            {matches.map(({ tour, score }, idx) => (
              <div className={`match-card ${idx === 0 ? 'top-match' : ''}`} key={tour.id}>
                <img src={tour.image} alt={tour.title} />
                <div className="match-info">
                  <div className="match-top">
                    <span className="match-score">{score}% Match</span>
                    <span className="rating-badge"><StarIcon /> {tour.rating || 4.8}</span>
                  </div>
                  <strong>{tour.title}</strong>
                  <small><MapPinIcon size={11} /> {tour.location} · {tour.duration}</small>
                  <div className="match-bottom">
                    <b>₹{Number(tour.price).toLocaleString('en-IN')}</b>
                    <div className="card-cta-pair">
                      <button type="button" className="button button-quiet button-xs" onClick={() => onSelectTour(tour)}>
                        Itinerary
                      </button>
                      <button type="button" className="button button-dark button-xs" onClick={() => onBookTour(tour)}>
                        Book ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="button button-quiet button-small matcher-back" onClick={() => setStep(0)}>
              Retake quiz
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
