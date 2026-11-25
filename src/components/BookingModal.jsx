import { useMemo, useState } from 'react';
import { BOOKING_ADDONS, createBooking, getUserPoints, validatePromoCode } from '../lib/storage.js';
import { CheckIcon, MapPinIcon, SparkleIcon } from './Icons.jsx';

function getToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const PAYMENT_TABS = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'wallet', label: 'Wallets / Later' },
];

export default function BookingModal({ tour, user, onClose, onBooked }) {
  const [travelDate, setTravelDate] = useState(getToday());
  const [guests, setGuests] = useState('2');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  const [paymentTab, setPaymentTab] = useState('upi');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [walletOption, setWalletOption] = useState('Pay at Check-in');

  const availablePoints = useMemo(() => getUserPoints(user?.id), [user?.id]);
  const [usePoints, setUsePoints] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const addonsTotal = useMemo(
    () =>
      BOOKING_ADDONS.filter((a) => selectedAddons.includes(a.id)).reduce(
        (sum, a) => sum + a.price,
        0,
      ),
    [selectedAddons],
  );
  const baseSubtotal = useMemo(() => Number(tour.price) * Number(guests), [tour.price, guests]);
  const subtotal = baseSubtotal + addonsTotal;
  const promoCheck = useMemo(() => validatePromoCode(appliedPromo, subtotal), [appliedPromo, subtotal]);
  const afterPromo = Math.max(0, subtotal - promoCheck.discountAmount);
  const pointsDiscount = usePoints ? Math.min(availablePoints, afterPromo) : 0;
  const total = Math.max(0, afterPromo - pointsDiscount);
  const pointsToEarn = Math.max(50, Math.round(total * 0.05));
  const perPersonSplit = Math.round(total / Math.max(1, Number(guests)));

  function toggleAddon(addonId) {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId],
    );
  }

  function handleApplyPromo() {
    setError('');
    const result = validatePromoCode(promoCode, subtotal);
    if (!promoCode.trim()) {
      setAppliedPromo('');
      return;
    }
    if (!result.valid) {
      setError(result.message);
      setAppliedPromo('');
      return;
    }
    setAppliedPromo(promoCode.trim().toUpperCase());
  }

  function getPaymentSummaryLabel() {
    if (paymentTab === 'upi') return `UPI · ${upiApp}${upiId ? ` (${upiId})` : ''}`;
    if (paymentTab === 'card') return `Card · Ending ${cardNumber.slice(-4) || '4242'}`;
    if (paymentTab === 'netbanking') return `Net Banking · ${bankName}`;
    return walletOption;
  }

  function submitBooking(event) {
    event.preventDefault();
    setError('');
    try {
      const created = createBooking({
        tour,
        user,
        travelDate,
        guests,
        contactPhone,
        specialRequests,
        promoCode: appliedPromo,
        paymentMethod: getPaymentSummaryLabel(),
        addons: selectedAddons,
        redeemPoints: pointsDiscount,
      });
      setConfirmedBooking(created);
      if (onBooked) onBooked(created);
    } catch (bookingError) {
      setError(bookingError.message || 'The booking could not be saved. Please try again.');
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
      <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close booking form">
          ×
        </button>

        {confirmedBooking ? (
          <div className="ticket-view">
            <div className="ticket-badge"><CheckIcon size={18} /></div>
            <div className="eyebrow dark-eyebrow">E-TICKET GENERATED</div>
            <h2 id="booking-title">Your journey is <em>reserved.</em></h2>
            <p className="booking-summary">
              <strong>{confirmedBooking.tourTitle}</strong>
              <span><MapPinIcon /> {confirmedBooking.location} · Booking ID: <b className="mono">{confirmedBooking.id}</b></span>
            </p>
            <div className="ticket-grid">
              <div><small>TRAVELLER</small><strong>{confirmedBooking.customerName}</strong></div>
              <div><small>DEPARTURE</small><strong>{confirmedBooking.travelDate}</strong></div>
              <div><small>GUESTS</small><strong>{confirmedBooking.guests} (₹{Number(confirmedBooking.perPersonSplit || confirmedBooking.total).toLocaleString('en-IN')} / person)</strong></div>
              <div><small>PAYMENT</small><strong>{confirmedBooking.paymentMethod}</strong></div>
              <div><small>STATUS</small><span className="status status-pending">{confirmedBooking.status}</span></div>
              <div><small>TOTAL PAID</small><strong>₹{Number(confirmedBooking.total).toLocaleString('en-IN')}</strong></div>
            </div>
            <div className="points-earned-banner">
              <SparkleIcon size={14} />
              <span>
                You earned <strong>+{confirmedBooking.pointsEarned || 0} TripNest Points</strong> for your next trip discount!
              </span>
            </div>
            <div className="ticket-actions">
              <button className="button button-quiet" type="button" onClick={() => window.print()}>
                Print E-Ticket
              </button>
              <button className="button button-dark" type="button" onClick={onClose}>
                Done <span>↗</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="eyebrow dark-eyebrow">NEW BOOKING REQUEST</div>
            <h2 id="booking-title">Plan your <em>journey.</em></h2>
            <p className="booking-summary">
              <strong>{tour.title}</strong>
              <span>{tour.location} · {tour.duration} · ₹{Number(tour.price).toLocaleString('en-IN')} per person</span>
            </p>
            <form className="form-stack" onSubmit={submitBooking}>
              <div className="form-row-2">
                <label>
                  Travel date
                  <input type="date" value={travelDate} min={getToday()} onChange={(e) => setTravelDate(e.target.value)} required />
                </label>
                <label>
                  Travellers
                  <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                    {Array.from({ length: 10 }, (_, index) => (
                      <option key={index + 1} value={String(index + 1)}>
                        {index + 1} {index === 0 ? 'traveller' : 'travellers'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="addons-box">
                <span className="addons-label">OPTIONAL EXPERIENCE UPGRADES</span>
                {BOOKING_ADDONS.map((addon) => {
                  const checked = selectedAddons.includes(addon.id);
                  return (
                    <label key={addon.id} className={`addon-row ${checked ? 'checked' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleAddon(addon.id)} />
                      <span>{addon.label}</span>
                      <b>+₹{addon.price.toLocaleString('en-IN')}</b>
                    </label>
                  );
                })}
              </div>

              <div className="form-row-2">
                <label>
                  Contact phone
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label>
                  Special requests
                  <input
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Meals, pickup, room..."
                  />
                </label>
              </div>

              <div className="payment-box">
                <span className="addons-label">PAYMENT METHOD</span>
                <div className="payment-tabs" role="tablist">
                  {PAYMENT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={paymentTab === tab.id}
                      className={`payment-tab ${paymentTab === tab.id ? 'active' : ''}`}
                      onClick={() => setPaymentTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {paymentTab === 'upi' && (
                  <div className="payment-subpanel">
                    <div className="upi-apps">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          className={`upi-pill ${upiApp === app ? 'active' : ''}`}
                          onClick={() => setUpiApp(app)}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. name@okaxis)"
                    />
                  </div>
                )}

                {paymentTab === 'card' && (
                  <div className="payment-subpanel">
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number (Visa / Mastercard / RuPay)"
                      maxLength={19}
                    />
                    <div className="form-row-2">
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        maxLength={7}
                      />
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {paymentTab === 'netbanking' && (
                  <div className="payment-subpanel">
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)}>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentTab === 'wallet' && (
                  <div className="payment-subpanel">
                    <select value={walletOption} onChange={(e) => setWalletOption(e.target.value)}>
                      <option>Pay at Check-in</option>
                      <option>Amazon Pay Balance</option>
                      <option>Simpl Pay-in-3 (0% EMI)</option>
                      <option>Mobikwik Wallet</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="promo-box">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (NEST10, HACK20, FIRST500)"
                  aria-label="Promo code"
                />
                <button className="button button-quiet button-small" type="button" onClick={handleApplyPromo}>
                  Apply
                </button>
              </div>
              {promoCheck.valid && <div className="promo-success">{promoCheck.message}</div>}

              {availablePoints > 0 && (
                <label className={`addon-row points-redeem-row ${usePoints ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                  />
                  <span>
                    Redeem TripNest Points (<strong>{availablePoints} pts</strong> available · 1 pt = ₹1)
                  </span>
                  <b>−₹{Math.min(availablePoints, afterPromo).toLocaleString('en-IN')}</b>
                </label>
              )}

              <div className="booking-breakdown">
                <div><span>Package ({guests} × ₹{Number(tour.price).toLocaleString('en-IN')})</span><span>₹{baseSubtotal.toLocaleString('en-IN')}</span></div>
                {addonsTotal > 0 && (
                  <div><span>Experience upgrades</span><span>+₹{addonsTotal.toLocaleString('en-IN')}</span></div>
                )}
                {promoCheck.discountAmount > 0 && (
                  <div className="discount-line"><span>Promo ({promoCheck.promo.code})</span><span>-₹{promoCheck.discountAmount.toLocaleString('en-IN')}</span></div>
                )}
                {pointsDiscount > 0 && (
                  <div className="discount-line"><span>TripNest Points Redeemed</span><span>-₹{pointsDiscount.toLocaleString('en-IN')}</span></div>
                )}
              </div>

              <div className="booking-total">
                <div>
                  <span>Total payable</span>
                  {Number(guests) > 1 && (
                    <small className="split-pill">Split: ₹{perPersonSplit.toLocaleString('en-IN')} / person</small>
                  )}
                  <small className="earn-pill">+ Earn {pointsToEarn} pts for next trip</small>
                </div>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>

              {error && <div className="form-error" role="alert">{error}</div>}
              <button className="button button-dark form-submit" type="submit">
                Pay &amp; generate e-ticket <span>↗</span>
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
