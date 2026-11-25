import { useEffect, useMemo, useState } from 'react';
import {
  cancelUserBooking,
  getBookings,
  getInquiries,
  getTours,
  getUserPoints,
  getWishlist,
  subscribeToStore,
  toggleWishlist,
} from '../lib/storage.js';
import { useAuth } from '../context/AuthContext.jsx';
import { HeartIcon, MapPinIcon, SearchIcon, StarIcon } from '../components/Icons.jsx';
import TourDetailModal from '../components/TourDetailModal.jsx';
import BookingModal from '../components/BookingModal.jsx';
import ReceiptModal from '../components/ReceiptModal.jsx';

const CATEGORIES = ['All', 'Nature', 'Beach', 'Culture', 'Adventure', 'City'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [tours, setTours] = useState(() => getTours());
  const [bookings, setBookings] = useState(() => getBookings().filter((b) => b.customerId === user.id));
  const [wishlist, setWishlist] = useState(() => getWishlist(user.id));
  const [points, setPoints] = useState(() => getUserPoints(user.id));
  const [inquiries, setInquiries] = useState(() =>
    getInquiries().filter((inq) => inq.email?.toLowerCase() === user.email?.toLowerCase()),
  );

  const [activeTab, setActiveTab] = useState('bookings');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [detailTour, setDetailTour] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeToStore(() => {
      setTours(getTours());
      setBookings(getBookings().filter((b) => b.customerId === user.id));
      setWishlist(getWishlist(user.id));
      setPoints(getUserPoints(user.id));
      setInquiries(getInquiries().filter((inq) => inq.email?.toLowerCase() === user.email?.toLowerCase()));
    });
  }, [user.id, user.email]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'Confirmed');
    const spent = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + Number(b.total || 0), 0);
    return {
      total: bookings.length,
      confirmed: confirmed.length,
      saved: wishlist.length,
      spent,
    };
  }, [bookings, wishlist]);

  const filteredTours = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tours.filter((tour) => {
      const matchesCat = category === 'All' || tour.category === category;
      const matchesQuery =
        !q || tour.title.toLowerCase().includes(q) || tour.location.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [tours, search, category]);

  const wishlistedTours = useMemo(
    () => tours.filter((tour) => wishlist.includes(tour.id)),
    [tours, wishlist],
  );

  function handleCancelBooking(bookingId) {
    setError('');
    try {
      cancelUserBooking(bookingId, user.id);
      setNotice(`Booking ${bookingId} has been cancelled.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-heading">
        <div>
          <div className="eyebrow dark-eyebrow">TRAVELLER WORKSPACE</div>
          <h1>
            Your next chapter,<br />
            <em>{user.name.split(' ')[0]}.</em>
          </h1>
          <p>Manage bookings, download e-tickets, and curate your saved wishlist.</p>
        </div>
        <div className="role-pill">
          <span /> TRAVELLER ACCOUNT
        </div>
      </section>

      {notice && (
        <div className="notice-bar" role="status">
          {notice}
          <button onClick={() => setNotice('')} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && <div className="form-error admin-error" role="alert">{error}</div>}

      <section className="stats-grid stats-grid-5">
        <div className="stat-card">
          <span>MY BOOKINGS</span>
          <strong>{stats.total}</strong>
          <small>Total reservations</small>
        </div>
        <div className="stat-card">
          <span>CONFIRMED TRIPS</span>
          <strong>{stats.confirmed}</strong>
          <small>Ready for departure</small>
        </div>
        <div className="stat-card">
          <span>SAVED WISHLIST</span>
          <strong>{stats.saved}</strong>
          <small>Shortlisted escapes</small>
        </div>
        <div className="stat-card">
          <span>TRAVEL VALUE</span>
          <strong>₹{stats.spent.toLocaleString('en-IN')}</strong>
          <small>Active bookings total</small>
        </div>
        <div className="stat-card points-stat-card">
          <span>TRIPNEST POINTS</span>
          <strong>{points.toLocaleString('en-IN')}</strong>
          <small>₹{points.toLocaleString('en-IN')} off next trip</small>
        </div>
      </section>

      <div className="dashboard-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bookings'}
          className={`dash-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'explore'}
          className={`dash-tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          Explore &amp; Book ({tours.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'wishlist'}
          className={`dash-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Saved Wishlist ({wishlistedTours.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inquiries'}
          className={`dash-tab ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          Custom Requests ({inquiries.length})
        </button>
      </div>

      {activeTab === 'bookings' && (
        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <div className="eyebrow dark-eyebrow">YOUR TRAVEL LOG</div>
              <h2>My bookings</h2>
            </div>
            <button type="button" className="button button-dark button-small" onClick={() => setActiveTab('explore')}>
              Book another trip ↗
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>Your next adventure belongs here.</h3>
              <p>Switch to Explore &amp; Book to reserve your first journey.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Journey</th>
                    <th>Travel date</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="mono">{booking.id}</td>
                      <td>
                        <strong>{booking.tourTitle}</strong>
                        <small className="table-sub">
                          {booking.location} · {booking.paymentMethod || 'Standard'}
                        </small>
                      </td>
                      <td>{booking.travelDate}</td>
                      <td>{booking.guests}</td>
                      <td>
                        ₹{Number(booking.total).toLocaleString('en-IN')}
                        {booking.promoCode && <small className="table-sub">Code: {booking.promoCode}</small>}
                      </td>
                      <td>
                        <span className={`status status-${String(booking.status).toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={() => setReceiptBooking(booking)}>
                            E-Ticket
                          </button>
                          {booking.status === 'Pending' && (
                            <button
                              type="button"
                              className="delete-action"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'explore' && (
        <section className="dashboard-section">
          <div className="filter-toolbar">
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations..."
              />
            </div>
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

          <div className="tour-grid dashboard-tour-grid">
            {filteredTours.map((tour) => {
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
                    <span className="tour-category">{tour.category}</span>
                    <button
                      type="button"
                      className={`wishlist-btn ${saved ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setWishlist(toggleWishlist(user.id, tour.id));
                      }}
                      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <HeartIcon filled={saved} />
                    </button>
                  </div>
                  <div className="tour-card-body">
                    <div className="tour-meta-row">
                      <span className="tour-location"><MapPinIcon /> {tour.location}</span>
                      <span className="rating-badge"><StarIcon /> {tour.rating || 4.8}</span>
                    </div>
                    <h3 className="clickable-title" onClick={() => setDetailTour(tour)}>{tour.title}</h3>
                    <p>{tour.description}</p>
                    <div className="tour-card-bottom">
                      <div>
                        <small>{tour.duration}</small>
                        <strong>₹{Number(tour.price).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="card-cta-pair">
                        <button type="button" className="button button-quiet button-xs" onClick={() => setDetailTour(tour)}>
                          Details
                        </button>
                        <button
                          className="round-arrow"
                          type="button"
                          onClick={() => setBookingTour(tour)}
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
        </section>
      )}

      {activeTab === 'wishlist' && (
        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <div className="eyebrow dark-eyebrow">SHORTLISTED ESCAPES</div>
              <h2>Saved wishlist</h2>
            </div>
          </div>
          {wishlistedTours.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♡</div>
              <h3>No saved journeys yet.</h3>
              <p>Tap the heart icon on any tour card to save it for later.</p>
            </div>
          ) : (
            <div className="tour-grid dashboard-tour-grid">
              {wishlistedTours.map((tour) => (
                <article className="tour-card" key={tour.id}>
                  <div className="tour-image-wrap" onClick={() => setDetailTour(tour)}>
                    <img src={tour.image} alt={tour.title} loading="lazy" />
                    <span className="tour-category">{tour.category}</span>
                    <button
                      type="button"
                      className="wishlist-btn active"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWishlist(toggleWishlist(user.id, tour.id));
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <HeartIcon filled />
                    </button>
                  </div>
                  <div className="tour-card-body">
                    <div className="tour-location"><MapPinIcon /> {tour.location}</div>
                    <h3>{tour.title}</h3>
                    <p>{tour.description}</p>
                    <div className="tour-card-bottom">
                      <div>
                        <small>{tour.duration}</small>
                        <strong>₹{Number(tour.price).toLocaleString('en-IN')}</strong>
                      </div>
                      <button className="round-arrow" type="button" onClick={() => setBookingTour(tour)}>
                        ↗
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'inquiries' && (
        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <div className="eyebrow dark-eyebrow">BESPOKE CONCIERGE</div>
              <h2>Custom trip requests</h2>
            </div>
          </div>
          {inquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>No custom trip requests yet.</h3>
              <p>Use the Custom Planner on the Explore page to request a bespoke itinerary.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Destination</th>
                    <th>Month</th>
                    <th>Travellers</th>
                    <th>Budget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq.id}>
                      <td className="mono">{inq.id}</td>
                      <td><strong>{inq.destination}</strong>{inq.notes && <small className="table-sub">{inq.notes}</small>}</td>
                      <td>{inq.preferredMonth}</td>
                      <td>{inq.travelers}</td>
                      <td>{inq.budget}</td>
                      <td><span className="status status-confirmed">{inq.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {detailTour && (
        <TourDetailModal
          tour={detailTour}
          user={user}
          isWishlisted={wishlist.includes(detailTour.id)}
          onToggleWishlist={(id) => setWishlist(toggleWishlist(user.id, id))}
          onClose={() => setDetailTour(null)}
          onBook={(t) => {
            setDetailTour(null);
            setBookingTour(t);
          }}
        />
      )}

      {bookingTour && (
        <BookingModal
          tour={bookingTour}
          user={user}
          onClose={() => setBookingTour(null)}
          onBooked={(b) => setNotice(`E-Ticket ${b.id} generated for ${b.tourTitle}!`)}
        />
      )}

      {receiptBooking && (
        <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />
      )}
    </div>
  );
}
