import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, User, Wrench, Upload, CheckCircle } from 'lucide-react';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = location.state?.role || 'customer';

  const [role, setRole] = useState(defaultRole);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPw: '', city: '', state: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Worker-specific
  const [skills, setSkills] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [hasCert, setHasCert] = useState(false);
  const [wantsTraining, setWantsTraining] = useState(false);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPw) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (role === 'worker' && !hasCert && !wantsTraining) {
      setError('Please upload an experience certificate OR enroll in our free offline training program.');
      return;
    }

    const result = await register({
      email: form.email, password: form.password,
      role, fullName: form.fullName, phone: form.phone,
    });

    if (!result.success) { setError(result.error); return; }

    if (result.needsEmailConfirm) {
      setSuccess(true);
    } else {
      navigate(role === 'worker' ? '/worker' : '/customer');
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-orb auth-orb-1" /><div className="auth-orb auth-orb-2" />
        <div className="auth-card animate-scale-in" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ color: 'var(--primary-700)' }}>Almost there!</h2>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            We've sent a confirmation email to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <Link to="/auth" className="auth-submit" style={{ marginTop: '2rem', display: 'block', textAlign: 'center' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" /><div className="auth-orb auth-orb-2" /><div className="auth-orb auth-orb-3" />
      <div className="auth-card auth-card-wide animate-fade-in-up">
        <div className="auth-brand">
          <img src="/logo.png" alt="Sahakar Seva Logo" className="auth-logo-img" />
          <div>
            <h1 className="auth-title">सहकार सेवा</h1>
            <p className="auth-subtitle">Create your account</p>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="auth-toggle-wrap">
          <button className={`auth-toggle ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
            <User size={16} /> Customer / ग्राहक
          </button>
          <button className={`auth-toggle ${role === 'worker' ? 'active' : ''}`} onClick={() => setRole('worker')}>
            <Wrench size={16} /> Worker / श्रमिक
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field-row">
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" value={form.fullName} onChange={set('fullName')} placeholder="Your name" required />
            </div>
            <div className="auth-field">
              <label>Phone Number</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" required />
            </div>
          </div>

          <div className="auth-field">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label>City</label>
              <input type="text" value={form.city} onChange={set('city')} placeholder="Your city" required />
            </div>
            <div className="auth-field">
              <label>State</label>
              <input type="text" value={form.state} onChange={set('state')} placeholder="State" required />
            </div>
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" required />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label>Confirm Password</label>
              <input type="password" value={form.confirmPw} onChange={set('confirmPw')} placeholder="••••••••" required />
            </div>
          </div>

          {/* Worker-specific section */}
          {role === 'worker' && (
            <div className="auth-worker-section">
              <h4>Worker Registration Details</h4>

              <div className="auth-field">
                <label>Skills (comma-separated)</label>
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Plumbing, Pipe Fitting, Electrical" />
              </div>

              {/* Certificate Upload */}
              <div className="auth-cert-section">
                <p className="auth-cert-label">Experience Certificate <span className="auth-required">*required</span></p>
                <label className={`auth-upload-btn ${certFile ? 'uploaded' : ''}`}>
                  <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => { setCertFile(e.target.files[0]); setHasCert(true); }} style={{ display: 'none' }} />
                  {certFile ? <><CheckCircle size={16} /> {certFile.name}</> : <><Upload size={16} /> Upload Certificate (PDF/JPG/PNG)</>}
                </label>
                <div className="auth-cert-or">
                  <span>OR</span>
                </div>
                <label className={`auth-training-check ${wantsTraining ? 'selected' : ''}`}>
                  <input type="checkbox" checked={wantsTraining} onChange={e => setWantsTraining(e.target.checked)} />
                  Enroll in <strong>Free Offline Training</strong> — Internship program for freshers
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : `Register as ${role === 'customer' ? 'ग्राहक (Customer)' : 'श्रमिक (Worker)'}`}
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/auth">Sign In →</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
