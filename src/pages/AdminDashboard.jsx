import { useEffect, useMemo, useState } from 'react';
import {
  deleteTour,
  getBookings,
  getInquiries,
  getTours,
  saveTour,
  subscribeToStore,
  updateBookingStatus,
  updateInquiryStatus,
} from '../lib/storage.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SearchIcon } from '../components/Icons.jsx';

const emptyForm = {
  title: '',
  location: '',
  duration: '',
  price: '',
  category: 'Nature',
  groupSize: 'Up to 8',
  difficulty: 'Easy',
  image: '',
  description: '',
  highlights: '',
  inclusions: '',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tours, setTours] = useState(() => getTours());
  const [bookings, setBookings] = useState(() => getBookings());
  const [inquiries, setInquiries] = useState(() => getInquiries());

  const [activeTab, setActiveTab] = useState('bookings');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeToStore(() => {
      setTours(getTours());
      setBookings(getBookings());
      setInquiries(getInquiries());
    });
  }, []);

  const stats = useMemo(() => {
    const confirmedRevenue = bookings
      .filter((b) => b.status === 'Confirmed')
      .reduce((sum, b) => sum + Number(b.total || 0), 0);
    return {
      tours: tours.length,
      bookings: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      revenue: confirmedRevenue,
      inquiries: inquiries.length,
    };
  }, [tours, bookings, inquiries]);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    tours.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / max) * 100),
    }));
  }, [tours]);

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchesQuery =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.tourTitle.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bookings, statusFilter, bookingSearch]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  }

  function submitTour(event) {
    event.preventDefault();
    setError('');
    try {
      const savedTours = saveTour({
        ...form,
        id: editingId || `tour-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        price: Number(form.price),
        image: form.image.trim(),
      });
      setTours(savedTours);
      setNotice(editingId ? 'Tour package updated.' : 'New tour package published.');
      resetForm();
    } catch (saveError) {
      setError(saveError.message || 'The tour package could not be saved.');
    }
  }

  function editTour(tour) {
    setActiveTab('packages');
    setEditingId(tour.id);
    setError('');
    setForm({
      title: tour.title || '',
      location: tour.location || '',
      duration: tour.duration || '',
      price: String(tour.price ?? ''),
      category: tour.category || 'Nature',
      groupSize: tour.groupSize || 'Up to 8',
      difficulty: tour.difficulty || 'Easy',
      image: tour.image || '',
      description: tour.description || '',
      highlights: Array.isArray(tour.highlights) ? tour.highlights.join('\n') : '',
      inclusions: Array.isArray(tour.inclusions) ? tour.inclusions.join(', ') : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function confirmDeleteTour() {
    if (!deleteTarget) return;
    setTours(deleteTour(deleteTarget.id));
    if (editingId === deleteTarget.id) resetForm();
    setNotice(`Tour package "${deleteTarget.title}" deleted.`);
    setDeleteTarget(null);
  }

  function changeStatus(id, status) {
    try {
      setBookings(updateBookingStatus(id, status));
      setNotice(`Booking ${id} updated to ${status}.`);
    } catch (statusError) {
      setError(statusError.message || 'The booking status could not be updated.');
    }
  }

  function changeInquiryStatus(id, status) {
    try {
      setInquiries(updateInquiryStatus(id, status));
      setNotice(`Inquiry ${id} marked as ${status}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard-page admin-page">
      <section className="dashboard-heading">
        <div>
          <div className="eyebrow dark-eyebrow">ADMIN COMMAND CENTER</div>
          <h1>
            Good day,<br />
            <em>{user.name.split(' ')[0]}.</em>
          </h1>
          <p>Monitor confirmed revenue, manage tour inventory, and approve reservations.</p>
        </div>
        <div className="role-pill admin-role">
          <span /> ADMINISTRATOR
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
          <span>CONFIRMED REVENUE</span>
          <strong>₹{stats.revenue.toLocaleString('en-IN')}</strong>
          <small>Approved bookings</small>
        </div>
        <div className="stat-card">
          <span>TOTAL BOOKINGS</span>
          <strong>{stats.bookings}</strong>
          <small>All customer requests</small>
        </div>
        <div className="stat-card">
          <span>PENDING REVIEW</span>
          <strong>{stats.pending}</strong>
          <small>Awaiting confirmation</small>
        </div>
        <div className="stat-card">
          <span>LIVE PACKAGES</span>
          <strong>{stats.tours}</strong>
          <small>Active catalogue</small>
        </div>
        <div className="stat-card">
          <span>CUSTOM INQUIRIES</span>
          <strong>{stats.inquiries}</strong>
          <small>Concierge leads</small>
        </div>
      </section>

      <section className="analytics-strip">
        <div className="analytics-card">
          <div className="eyebrow dark-eyebrow">CATALOGUE MIX BY CATEGORY</div>
          <div className="bar-chart">
            {categoryBreakdown.map((item) => (
              <div className="bar-row" key={item.name}>
                <span>{item.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${item.pct}%` }} />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
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
          Booking Requests ({bookings.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'packages'}
          className={`dash-tab ${activeTab === 'packages' ? 'active' : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          Manage Packages ({tours.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'inquiries'}
          className={`dash-tab ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          Concierge Inquiries ({inquiries.length})
        </button>
      </div>

      {activeTab === 'bookings' && (
        <section className="dashboard-section">
          <div className="filter-toolbar">
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                type="search"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search booking ID, customer, or journey..."
              />
            </div>
            <div className="category-pills">
              {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`category-pill ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>No matching bookings.</h3>
              <p>Adjust your search or status filter to see reservations.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Journey</th>
                    <th>Travel date</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="mono">{booking.id}</td>
                      <td>
                        <strong>{booking.customerName}</strong>
                        <small className="table-sub">
                          {booking.customerEmail}
                          {booking.contactPhone ? ` · ${booking.contactPhone}` : ''}
                        </small>
                      </td>
                      <td>
                        {booking.tourTitle}
                        {booking.specialRequests && (
                          <small className="table-sub">Note: {booking.specialRequests}</small>
                        )}
                      </td>
                      <td>{booking.travelDate}</td>
                      <td>{booking.guests}</td>
                      <td>
                        ₹{Number(booking.total).toLocaleString('en-IN')}
                        {booking.promoCode && <small className="table-sub">Promo: {booking.promoCode}</small>}
                      </td>
                      <td>
                        <span className={`status status-${String(booking.status).toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          aria-label={`Status for booking ${booking.id}`}
                          value={booking.status}
                          onChange={(event) => changeStatus(booking.id, event.target.value)}
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'packages' && (
        <>
          <section className="dashboard-section admin-form-section">
            <div className="section-title-row">
              <div>
                <div className="eyebrow dark-eyebrow">PACKAGE STUDIO</div>
                <h2>{editingId ? 'Edit a journey' : 'Add a new journey'}</h2>
              </div>
            </div>
            <form className="admin-form" onSubmit={submitTour}>
              <label>
                Package title
                <input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="e.g. Coorg Coffee Trails"
                  required
                />
              </label>
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="City, state"
                  required
                />
              </label>
              <label>
                Duration
                <input
                  value={form.duration}
                  onChange={(e) => update('duration', e.target.value)}
                  placeholder="3 days / 2 nights"
                  required
                />
              </label>
              <label>
                Price (₹)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  placeholder="5999"
                  required
                />
              </label>
              <label>
                Category
                <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                  <option>Nature</option>
                  <option>Beach</option>
                  <option>Culture</option>
                  <option>Adventure</option>
                  <option>City</option>
                </select>
              </label>
              <label>
                Difficulty
                <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Challenging</option>
                </select>
              </label>
              <label className="form-wide">
                Image URL
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => update('image', e.target.value)}
                  placeholder="https://images.unsplash.com/... (optional)"
                />
              </label>
              {form.image && (
                <div className="form-wide image-preview-wrap">
                  <img src={form.image} alt="Package preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span>Live cover preview</span>
                </div>
              )}
              <label className="form-wide">
                Short description
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe the experience..."
                  rows="2"
                  required
                />
              </label>
              <label className="form-wide">
                Highlights (one per line, optional)
                <textarea
                  value={form.highlights}
                  onChange={(e) => update('highlights', e.target.value)}
                  placeholder="Sunrise trek&#10;Local culinary tasting"
                  rows="2"
                />
              </label>
              <label className="form-wide">
                Inclusions (comma-separated, optional)
                <input
                  value={form.inclusions}
                  onChange={(e) => update('inclusions', e.target.value)}
                  placeholder="Boutique stay, Daily breakfast, Private transfers"
                />
              </label>
              <div className="form-actions">
                <button className="button button-dark" type="submit">
                  {editingId ? 'Save changes' : 'Publish package'} <span>↗</span>
                </button>
                {editingId && (
                  <button className="button button-quiet" type="button" onClick={resetForm}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="dashboard-section">
            <div className="section-title-row">
              <div>
                <div className="eyebrow dark-eyebrow">LIVE CATALOGUE</div>
                <h2>Manage packages</h2>
              </div>
              <span className="muted-count">{tours.length} PACKAGES</span>
            </div>
            <div className="admin-tour-list">
              {tours.map((tour) => (
                <div className="admin-tour-row" key={tour.id}>
                  <img
                    src={tour.image}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.visibility = 'hidden';
                    }}
                  />
                  <div className="admin-tour-info">
                    <strong>{tour.title}</strong>
                    <span>
                      {tour.location} · {tour.duration} · {tour.category}
                    </span>
                  </div>
                  <strong className="admin-tour-price">₹{Number(tour.price).toLocaleString('en-IN')}</strong>
                  <div className="row-actions">
                    <button type="button" onClick={() => editTour(tour)}>Edit</button>
                    <button type="button" className="delete-action" onClick={() => setDeleteTarget(tour)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === 'inquiries' && (
        <section className="dashboard-section">
          <div className="section-title-row">
            <div>
              <div className="eyebrow dark-eyebrow">BESPOKE LEADS</div>
              <h2>Concierge inquiries</h2>
            </div>
          </div>
          {inquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>No custom inquiries yet.</h3>
              <p>Requests submitted from the Home page Custom Planner will appear here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Traveller</th>
                    <th>Destination</th>
                    <th>Month &amp; Group</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq.id}>
                      <td className="mono">{inq.id}</td>
                      <td>
                        <strong>{inq.name}</strong>
                        <small className="table-sub">{inq.email}</small>
                      </td>
                      <td>
                        <strong>{inq.destination}</strong>
                        {inq.notes && <small className="table-sub">{inq.notes}</small>}
                      </td>
                      <td>{inq.preferredMonth} · {inq.travelers} guests</td>
                      <td>{inq.budget}</td>
                      <td><span className="status status-pending">{inq.status}</span></td>
                      <td>
                        <select
                          className="status-select"
                          value={inq.status}
                          onChange={(e) => changeInquiryStatus(inq.id, e.target.value)}
                        >
                          <option>New</option>
                          <option>In Progress</option>
                          <option>Quoted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {deleteTarget && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <section className="booking-modal confirm-modal" role="dialog" aria-modal="true">
            <div className="eyebrow dark-eyebrow">CONFIRM REMOVAL</div>
            <h2>Delete <em>{deleteTarget.title}?</em></h2>
            <p className="fine-print">
              This removes the package from the public catalogue. Existing customer booking records remain preserved.
            </p>
            <div className="ticket-actions">
              <button type="button" className="button button-quiet" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="button button-danger" onClick={confirmDeleteTour}>
                Delete package
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
