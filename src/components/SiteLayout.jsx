import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { resetDemoData } from '../lib/storage.js';

export default function SiteLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  function handleResetDemo() {
    resetDemoData();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <div className="promo-ribbon">
        <span>NEW SEASON OFFER · Use code <strong>NEST10</strong> for 10% off or <strong>HACK20</strong> for 20% off any journey</span>
      </div>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="TripNest home">
          <span className="brand-mark">T</span>
          <span>
            trip<span className="brand-accent">nest</span>
            <small>TRAVEL, BEAUTIFULLY PLANNED</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Explore</NavLink>
          <a href="/#concierge">Custom Planner</a>
          {user?.role === 'user' && <NavLink to="/user">My dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin panel</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="welcome-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="button button-quiet button-small" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login">Log in</Link>
              <Link className="button button-primary button-small" to="/signup">Create account</Link>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <strong>trip<span className="brand-accent">nest</span></strong>
            <p>Handpicked boutique escapes, transparent pricing, and 24/7 travel concierge across India.</p>
          </div>
          <div>
            <h4>DESTINATIONS</h4>
            <ul>
              <li><a href="/#destinations">Munnar &amp; Kerala</a></li>
              <li><a href="/#destinations">North Goa Coast</a></li>
              <li><a href="/#destinations">Jaipur &amp; Udaipur</a></li>
              <li><a href="/#destinations">Manali &amp; Ladakh</a></li>
            </ul>
          </div>
          <div>
            <h4>PLATFORM</h4>
            <ul>
              <li><Link to="/user">Traveller Dashboard</Link></li>
              <li><Link to="/admin">Admin Command Center</Link></li>
              <li><a href="/#concierge">Bespoke Trip Planner</a></li>
              <li><a href="/#faq">Travel FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4>CONCIERGE</h4>
            <p>hello@tripnest.travel</p>
            <p>+91 80 4123 9800 · 9 AM – 9 PM IST</p>
            <button type="button" className="reset-demo-btn" onClick={handleResetDemo}>
              Reset demo data
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TripNest Curated Journeys. All rights reserved.</span>
          <span>Instant E-Tickets · Flexible Rescheduling · Verified Stays</span>
        </div>
      </footer>
    </div>
  );
}
