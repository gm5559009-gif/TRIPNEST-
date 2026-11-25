import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Use a password with at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('The passwords do not match.');
    try {
      signup({ name: form.name, email: form.email, password: form.password });
      navigate('/user', { replace: true });
    } catch (err) { setError(err.message); }
  }

  return <section className="auth-layout"><div className="auth-image signup-image"><img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85" alt="Sunlit mountain peaks" /><div className="auth-image-caption"><span>MAKE ROOM FOR WONDER</span><strong>Your next favourite<br />place is out there.</strong></div></div><div className="auth-panel"><div className="auth-form-wrap"><div className="eyebrow dark-eyebrow">COME ON IN</div><h1>Let’s get you<br /><em>out there.</em></h1><p className="auth-subtitle">Create an account to start planning your next escape.</p>
    <form onSubmit={handleSubmit} className="form-stack"><label>Full name<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" autoComplete="name" required /></label><label>Email address<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" minLength={6} required /></label><label>Confirm password<input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Enter password again" autoComplete="new-password" required /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-dark form-submit" type="submit">Create account <span>↗</span></button></form>
    <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p><p className="fine-print">New registrations receive the User role. Admin access is reserved for the demo administrator.</p>
  </div></div></section>;
}
