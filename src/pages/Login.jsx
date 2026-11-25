import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const signedIn = login(email, password);
      navigate(location.state?.from || (signedIn.role === 'admin' ? '/admin' : '/user'), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  function quickLogin(demoEmail, demoPassword) {
    setError('');
    try {
      const signedIn = login(demoEmail, demoPassword);
      navigate(location.state?.from || (signedIn.role === 'admin' ? '/admin' : '/user'), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85"
          alt="Peaceful lake and mountain view"
        />
        <div className="auth-image-caption">
          <span>TAKE THE SCENIC ROUTE</span>
          <strong>There’s a world<br />waiting outside.</strong>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="eyebrow dark-eyebrow">WELCOME BACK</div>
          <h1>Pick up where<br /><em>you left off.</em></h1>
          <p className="auth-subtitle">Log in to manage your bookings, wishlist, and e-tickets.</p>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-dark form-submit" type="submit">
              Log in <span>↗</span>
            </button>
          </form>
          <p className="auth-switch">
            New to TripNest? <Link to="/signup">Create an account</Link>
          </p>
          <div className="demo-credentials">
            <strong>One-click demo access</strong>
            <div className="demo-btn-row">
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => quickLogin('user@tripnest.demo', 'user123')}
              >
                Traveller Demo ↗
              </button>
              <button
                type="button"
                className="button button-dark button-small"
                onClick={() => quickLogin('admin@tripnest.demo', 'admin123')}
              >
                Admin Demo ↗
              </button>
            </div>
            <span>User: user@tripnest.demo / user123</span>
            <span>Admin: admin@tripnest.demo / admin123</span>
          </div>
        </div>
      </div>
    </section>
  );
}
