import { useState } from 'react';
import { getPackingChecklistForCategory } from '../lib/storage.js';
import { CheckIcon, MapPinIcon } from './Icons.jsx';

export default function ReceiptModal({ booking, onClose }) {
  const checklistItems = getPackingChecklistForCategory(booking?.tourCategory || 'Nature');
  const storageKey = `tripnest_pack_${booking?.id}`;

  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!booking) return null;

  function toggleItem(item) {
    const next = checkedItems.includes(item)
      ? checkedItems.filter((i) => i !== item)
      : [...checkedItems, item];
    setCheckedItems(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore storage errors
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
      <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close e-ticket">
          ×
        </button>
        <div className="ticket-view">
          <div className="ticket-badge"><CheckIcon size={18} /></div>
          <div className="eyebrow dark-eyebrow">TRIPNEST E-TICKET</div>
          <h2 id="receipt-title">Booking <em>Pass.</em></h2>
          <p className="booking-summary">
            <strong>{booking.tourTitle}</strong>
            <span><MapPinIcon /> {booking.location} · ID: <b className="mono">{booking.id}</b></span>
          </p>
          <div className="ticket-grid">
            <div><small>TRAVELLER</small><strong>{booking.customerName}</strong></div>
            <div><small>DEPARTURE</small><strong>{booking.travelDate}</strong></div>
            <div><small>GUESTS</small><strong>{booking.guests}</strong></div>
            <div><small>PAYMENT</small><strong>{booking.paymentMethod || 'Standard'}</strong></div>
            <div><small>STATUS</small><span className={`status status-${String(booking.status).toLowerCase()}`}>{booking.status}</span></div>
            <div><small>TOTAL</small><strong>₹{Number(booking.total).toLocaleString('en-IN')}</strong></div>
          </div>

          {booking.specialRequests && (
            <p className="fine-print"><strong>Special notes:</strong> {booking.specialRequests}</p>
          )}

          <div className="packing-box">
            <div className="packing-head">
              <div className="eyebrow dark-eyebrow">SMART PACKING CHECKLIST</div>
              <span>{checkedItems.length}/{checklistItems.length} packed</span>
            </div>
            <div className="packing-list">
              {checklistItems.map((item) => {
                const done = checkedItems.includes(item);
                return (
                  <label key={item} className={`packing-item ${done ? 'done' : ''}`}>
                    <input type="checkbox" checked={done} onChange={() => toggleItem(item)} />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="ticket-actions">
            <button className="button button-quiet" type="button" onClick={() => window.print()}>
              Print / Save PDF
            </button>
            <button className="button button-dark" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
