import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockWorkers } from '../../data/mockWorkers';
import { getBookingsByWorker } from '../../data/mockBookings';
import { Power, Star, Briefcase, IndianRupee, Clock, Shield, TrendingUp, BookOpen, Phone, AlertTriangle, CheckCircle, Award, Umbrella } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatsCard from '../../components/ui/StatsCard';
import HelplineModal from '../../components/HelplineModal';
import './WorkerDashboard.css';

export default function WorkerDashboard() {
  const { user, profile, workerProfile } = useAuth();
  const navigate = useNavigate();
  const mockWorker = mockWorkers.find(w => w.id === user?.id) || mockWorkers[0];
  const worker = {
    ...mockWorker,
    fullName: profile?.full_name || mockWorker.name,
    cibil_score: workerProfile?.cibil_score ?? 758,
    weekly_hours_worked: workerProfile?.weekly_hours_worked ?? 38,
    insurance_eligible: workerProfile?.insurance_eligible ?? true,
    tier: workerProfile?.tier ?? 'tier2',
    leave_balance: workerProfile?.leave_balance ?? 28,
    loyalty_bonus_eligible: workerProfile?.loyalty_bonus_eligible ?? true,
  };
  const bookings = getBookingsByWorker(mockWorker.id);
  const activeBooking = bookings.find(b => ['en-route', 'in-progress', 'assigned'].includes(b.status));
  const [isAvailable, setIsAvailable] = useState(worker.available);
  const [showHelpline, setShowHelpline] = useState(false);

  const weeklyHoursPercent = Math.min((worker.weekly_hours_worked / 40) * 100, 100);
  const isNearOvertime = worker.weekly_hours_worked >= 36;
  const isAtOvertime = worker.weekly_hours_worked >= 40;

  return (
    <div className="worker-dashboard">
      {/* Availability Toggle */}
      <div className={`availability-toggle ${isAvailable ? 'available' : 'unavailable'}`}>
        <div className="avail-content">
          <Power size={24} />
          <div>
            <h3>{isAvailable ? "You're Online" : "You're Offline"}</h3>
            <p>{isAvailable ? 'Accepting new jobs' : 'Not accepting jobs right now'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="helpline-fab-btn" onClick={() => setShowHelpline(true)} title="Helpline">
            <Phone size={16} />
          </button>
          <button
            className={`toggle-switch ${isAvailable ? 'on' : 'off'}`}
            onClick={() => setIsAvailable(!isAvailable)}
            aria-label="Toggle availability"
          >
            <div className="toggle-knob" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 gap-4 mb-8">
        <StatsCard label="Jobs Done" value={worker.totalJobs} icon={Briefcase} color="primary" trend="up" trendValue="12%" />
        <StatsCard label="Earnings" value={`₹${worker.earnings}`} icon={IndianRupee} color="success" trend="up" trendValue="8%" />
        <StatsCard label="Rating" value={worker.rating.toFixed(1)} icon={Star} color="warning" />
        <StatsCard label="Queue Position" value={`#${worker.fairnessPosition}`} icon={Clock} color="info" />
      </div>

      {/* Welfare Cards Row */}
      <div className="worker-welfare-grid mb-8">
        {/* CIBIL Score */}
        <Card variant="elevated" className="welfare-card">
          <div className="welfare-icon primary"><TrendingUp size={20} /></div>
          <div className="welfare-info">
            <span className="welfare-label">Civil Quality Score</span>
            <span className="welfare-value">{worker.cibil_score} <small>/ 900</small></span>
            <div className="welfare-bar">
              <div className="welfare-bar-fill" style={{ width: `${(worker.cibil_score / 900) * 100}%`, background: worker.cibil_score > 750 ? '#10b981' : '#f59e0b' }} />
            </div>
            <span className="welfare-sub">{worker.cibil_score > 750 ? '🌟 Excellent — Priority jobs eligible' : '📈 Keep improving to unlock better jobs'}</span>
          </div>
        </Card>

        {/* Weekly Hours */}
        <Card variant="elevated" className={`welfare-card ${isNearOvertime ? 'welfare-warn' : ''}`}>
          <div className={`welfare-icon ${isAtOvertime ? 'danger' : isNearOvertime ? 'warning' : 'success'}`}><Clock size={20} /></div>
          <div className="welfare-info">
            <span className="welfare-label">Weekly Hours</span>
            <span className="welfare-value">{worker.weekly_hours_worked}h <small>/ 40h max</small></span>
            <div className="welfare-bar">
              <div className="welfare-bar-fill" style={{ width: `${weeklyHoursPercent}%`, background: isAtOvertime ? '#ef4444' : isNearOvertime ? '#f59e0b' : '#10b981' }} />
            </div>
            <span className="welfare-sub">
              {isAtOvertime ? '🚫 Cap reached — Overtime only if no other worker available (1.5x bonus)' : isNearOvertime ? '⚠️ Approaching 40h limit' : '✅ Healthy work week'}
            </span>
          </div>
        </Card>

        {/* Insurance */}
        <Card variant="elevated" className="welfare-card">
          <div className={`welfare-icon ${worker.insurance_eligible ? 'success' : 'warning'}`}><Umbrella size={20} /></div>
          <div className="welfare-info">
            <span className="welfare-label">Worker Insurance</span>
            <span className="welfare-value" style={{ color: worker.insurance_eligible ? 'var(--success-600)' : 'var(--warning-600)' }}>
              {worker.insurance_eligible ? 'Active ✅' : 'Not yet eligible'}
            </span>
            <span className="welfare-sub">{worker.insurance_eligible ? 'Health + Accident coverage via Cooperative' : 'Eligible after 3 months of service'}</span>
          </div>
        </Card>

        {/* Leave */}
        <Card variant="elevated" className="welfare-card">
          <div className="welfare-icon primary"><Award size={20} /></div>
          <div className="welfare-info">
            <span className="welfare-label">Leave Balance</span>
            <span className="welfare-value">{worker.leave_balance} <small>days left</small></span>
            <span className="welfare-sub">30 annual + emergency leaves • <button className="welfare-link" onClick={() => navigate('/worker/leave')}>Apply →</button></span>
            {worker.loyalty_bonus_eligible && (
              <div className="loyalty-badge">🎁 1-Year Loyalty Bonus: ₹2,500 eligible!</div>
            )}
          </div>
        </Card>
      </div>

      {/* City Tier Badge */}
      <div className="city-tier-banner mb-6">
        <Shield size={16} />
        <span>You are in <strong>Tier {worker.tier?.replace('tier', '') || '2'}</strong> city •
          {worker.tier === 'tier1' ? ' Premium zone — highest job density' :
            worker.tier === 'tier2' ? ' Standard zone' :
              ' Rural zone — relocation incentives available'}
        </span>
        <Badge variant="primary" size="sm">Mobility Program</Badge>
      </div>

      {/* Active Job */}
      {activeBooking && (
        <section className="mb-8 animate-fade-in-up">
          <h2 className="section-title">Active Job</h2>
          <Card variant="elevated" className="active-job-card">
            <div className="active-job-header">
              <Badge variant="warning" pulse>In Progress</Badge>
              <span className="text-sm font-semibold">₹{activeBooking.totalPrice}</span>
            </div>
            <h3>{activeBooking.serviceName}</h3>
            <p className="text-sm text-muted">{activeBooking.description}</p>
            <div className="active-job-meta">
              <span>📍 {activeBooking.address.split(',')[0]}</span>
              <span>👤 {activeBooking.customerName}</span>
              <span>📅 {activeBooking.date} • {activeBooking.time}</span>
            </div>
          </Card>
        </section>
      )}

      {/* Training CTA */}
      <Card variant="gradient" className="training-cta-card mb-6" onClick={() => navigate('/worker/training')} style={{ cursor: 'pointer' }}>
        <BookOpen size={24} />
        <div>
          <h4>🎓 Free Training Available</h4>
          <p className="text-sm">Upgrade skills, earn certificates, unlock better-paying jobs</p>
        </div>
        <Badge variant="success">Free</Badge>
      </Card>

      {/* Recent Jobs */}
      <section>
        <h2 className="section-title">Recent Jobs</h2>
        <div className="recent-jobs-list">
          {bookings.slice(0, 5).map(booking => (
            <Card key={booking.id} className="recent-job-item">
              <div className="recent-job-left">
                <h4>{booking.serviceName}</h4>
                <p className="text-xs text-muted">{booking.date} • {booking.customerName}</p>
              </div>
              <div className="recent-job-right">
                <Badge variant={booking.status === 'completed' ? 'success' : 'default'} size="sm">
                  {booking.status.replace('-', ' ')}
                </Badge>
                <span className="font-semibold">₹{booking.totalPrice}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <HelplineModal isOpen={showHelpline} onClose={() => setShowHelpline(false)} role="worker" />
    </div>
  );
}
