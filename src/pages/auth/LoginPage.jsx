import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, User, Wrench, Shield, ChevronRight, Phone } from 'lucide-react';
import './AuthPages.css';

const DEMO_CREDENTIALS = {
  customer: { email: 'demo.customer@sahakar.in', password: 'demo123' },
  worker: { email: 'demo.worker@sahakar.in', password: 'demo123' },
  admin: { email: 'admin@sahakar.in', password: 'admin123' },
};

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    const demo = DEMO_CREDENTIALS[role];
    if (demo) { setEmail(demo.email); setPassword(demo.password); }
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.');
      return;
    }
    const roleRoutes = { customer: '/customer', worker: '/worker', admin: '/admin' };
    navigate(roleRoutes[selectedRole] || '/customer');
  };

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card animate-fade-in-up">
        {/* Brand */}
        <div className="auth-brand">
          <img src="/logo.png" alt="Sahakar Seva Logo" className="auth-logo-img" />
          <div>
            <h1 className="auth-title">सहकार सेवा</h1>
            <p className="auth-subtitle">Sahakar Seva • Cooperative Home Services</p>
          </div>
        </div>

        <p className="auth-welcome">सुस्वागतम् — Welcome Back! নমস্কার</p>

        {/* Role Selector */}
        {!selectedRole ? (
          <div className="auth-role-select">
            <p className="auth-role-label">Who are you?</p>
            <div className="auth-role-grid">
              <button className="auth-role-card" onClick={() => handleRoleSelect('customer')}>
                <div className="auth-role-icon customer-icon"><User size={28} /></div>
                <h3>सेवा चाहिए</h3>
                <p>I need a home service</p>
                <ChevronRight size={18} className="auth-role-arrow" />
              </button>
              <button className="auth-role-card" onClick={() => handleRoleSelect('worker')}>
                <div className="auth-role-icon worker-icon"><Wrench size={28} /></div>
                <h3>सेवा देना है</h3>
                <p>I am a skilled worker</p>
                <ChevronRight size={18} className="auth-role-arrow" />
              </button>
            </div>
            <button className="auth-admin-link" onClick={() => handleRoleSelect('admin')}>
              <Shield size={14} /> Admin / Prashasan Access
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            <button type="button" className="auth-back" onClick={() => { setSelectedRole(null); setError(''); }}>
              ← Back
            </button>
            <div className={`auth-role-pill ${selectedRole}`}>
              {selectedRole === 'customer' ? <User size={14} /> : selectedRole === 'worker' ? <Wrench size={14} /> : <Shield size={14} />}
              {selectedRole === 'customer' ? 'Customer / ग्राहक' : selectedRole === 'worker' ? 'Worker / श्रमिक' : 'Admin / प्रशासन'}
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : `Sign In as ${selectedRole === 'customer' ? 'ग्राहक' : selectedRole === 'worker' ? 'श्रमिक' : 'Admin'}`}
            </button>

            <p className="auth-hint">
              🚀 Demo credentials pre-filled — just click Sign In!
            </p>

            {selectedRole !== 'admin' && (
              <p className="auth-switch">
                New to Sahakar Seva?{' '}
                <Link to="/auth/register" state={{ role: selectedRole }}>Create Account →</Link>
              </p>
            )}
          </form>
        )}

        <div className="auth-helpline">
          <Phone size={12} />
          Helpline: <strong>1800-XXX-SEVA</strong> (24x7 Toll-Free)
        </div>
      </div>
    </div>
  );
}
