import { useMemo, useState } from 'react';
import { PROMO_CODES, validatePromoCode } from '../lib/storage.js';
import { CheckIcon, UsersIcon } from './Icons.jsx';

export default function SplitCalculatorModal({ tours, initialTour, onClose, onBookTour }) {
  const [selectedId, setSelectedId] = useState(initialTour?.id || tours[0]?.id || '');
  const tour = useMemo(() => tours.find((t) => t.id === selectedId) || tours[0], [tours, selectedId]);

  const [guests, setGuests] = useState(3);
  const [promoInput, setPromoInput] = useState('NEST10');
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'host50'
  const [friendNames, setFriendNames] = useState(['You', 'Friend 2', 'Friend 3']);
  const [copied, setCopied] = useState(false);

  if (!tour) return null;

  const subtotal = Number(tour.price) * guests;
  const promoResult = validatePromoCode(promoInput, subtotal);
  const total = Math.max(0, subtotal - promoResult.discountAmount);

  function updateGuestCount(count) {
    const nextCount = Math.max(2, Math.min(10, Number(count) || 2));
    setGuests(nextCount);
    setFriendNames((prev) => {
      const next = [...prev];
      while (next.length < nextCount) next.push(`Friend ${next.length + 1}`);
      return next.slice(0, nextCount);
    });
  }

  const shares = useMemo(() => {
    if (splitMode === 'host50' && guests > 1) {
      const hostShare = Math.round(total * 0.5);
      const remaining = total - hostShare;
      const otherShare = Math.round(remaining / (guests - 1));
      return friendNames.map((name, idx) => ({
        name: name || `Traveller ${idx + 1}`,
        amount: idx === 0 ? hostShare : otherShare,
      }));
    }
    const perPerson = Math.round(total / guests);
    return friendNames.map((name, idx) => ({
      name: name || `Traveller ${idx + 1}`,
      amount: perPerson,
    }));
  }, [friendNames, guests, splitMode, total]);

  function copySummary() {
    const lines = [
      `TripNest Group Split — ${tour.title} (${tour.location})`,
      `Total (${guests} travellers): ₹${total.toLocaleString('en-IN')}${promoResult.valid ? ` [Code: ${promoResult.promo.code}]` : ''}`,
      ...shares.map((s) => `• ${s.name}: ₹${s.amount.toLocaleString('en-IN')}`),
    ].join('\n');
    navigator.clipboard?.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="booking-modal split-studio-modal" role="dialog" aria-modal="true" aria-labelledby="split-studio-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close Split Calculator">
          ×
        </button>

        <div className="matcher-badge">
          <UsersIcon size={14} /> GROUP SPLIT-BILL STUDIO
        </div>
        <h2 id="split-studio-title">Split &amp; plan <em>together.</em></h2>
        <p className="booking-summary">
          <span>Calculate per-person shares with promo codes, choose equal or host-subsidized splits, and copy a ready-to-share group summary.</span>
        </p>

        <div className="form-stack">
          <div className="form-row-2">
            <label>
              Select journey
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} (₹{Number(t.price).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Group size
              <select value={guests} onChange={(e) => updateGuestCount(e.target.value)}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} travellers</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row-2">
            <label>
              Promo code
              <select value={promoInput} onChange={(e) => setPromoInput(e.target.value)}>
                <option value="">No promo</option>
                {Object.values(PROMO_CODES).map((p) => (
                  <option key={p.code} value={p.code}>{p.code} ({p.label})</option>
                ))}
              </select>
            </label>
            <label>
              Split mode
              <select value={splitMode} onChange={(e) => setSplitMode(e.target.value)}>
                <option value="equal">Equal Split (All pay same)</option>
                <option value="host50">Treat Mode (Organizer 50%)</option>
              </select>
            </label>
          </div>

          <div className="split-shares-box">
            <span className="addons-label">CUSTOMIZE TRAVELLER NAMES &amp; SHARES</span>
            <div className="split-shares-list">
              {shares.map((share, idx) => (
                <div className="split-share-row" key={idx}>
                  <input
                    value={friendNames[idx] || ''}
                    onChange={(e) => {
                      const next = [...friendNames];
                      next[idx] = e.target.value;
                      setFriendNames(next);
                    }}
                    placeholder={`Traveller ${idx + 1}`}
                  />
                  <strong>₹{share.amount.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-total">
            <div>
              <span>Group Total</span>
              <small className="split-pill">
                {promoResult.valid ? `Saved ₹${promoResult.discountAmount.toLocaleString('en-IN')} with ${promoResult.promo.code}` : 'Select a promo to save more'}
              </small>
            </div>
            <strong>₹{total.toLocaleString('en-IN')}</strong>
          </div>

          <div className="ticket-actions">
            <button type="button" className="button button-quiet" onClick={copySummary}>
              {copied ? <><CheckIcon size={13} /> Copied for WhatsApp!</> : 'Copy Split Summary'}
            </button>
            {onBookTour && (
              <button type="button" className="button button-dark" onClick={() => onBookTour(tour)}>
                Book this trip <span>↗</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
