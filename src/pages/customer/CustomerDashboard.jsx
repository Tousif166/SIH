import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Zap, SprayCan, Paintbrush, Hammer, Wind, Bug, Settings, ArrowRight, Clock, MapPin, Bell, X, Phone } from 'lucide-react';
import { mockServices } from '../../data/mockServices';
import { getBookingsByCustomer } from '../../data/mockBookings';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import HelplineModal from '../../components/HelplineModal';
import './CustomerDashboard.css';

const iconMap = { Wrench, Zap, SprayCan, Paintbrush, Hammer, Wind, Bug, Settings };

const statusColors = {
  'en-route': 'info',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
  assigned: 'primary',
  booked: 'default'
};

// Maintenance reminder data (in real app comes from Supabase)
const MOCK_REMINDERS = [
  { id: 1, service_name: 'AC Filter Cleaning', next_due_date: '2026-09-05', interval_days: 90, icon: '❄️' },
  { id: 2, service_name: 'RO Water Purifier Service', next_due_date: '2026-09-12', interval_days: 60, icon: '💧' },
  { id: 3, service_name: 'Chimney Cleaning', next_due_date: '2026-09-20', interval_days: 45, icon: '🔥' },
];

export default function CustomerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const bookings = getBookingsByCustomer(user?.id);
  const activeBookings = bookings.filter(b => ['en-route', 'in-progress', 'assigned'].includes(b.status));
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [showHelpline, setShowHelpline] = useState(false);

  const displayName = profile?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  const dismissReminder = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner animate-fade-in-up">
        <div>
          <h1>नमस्ते, {displayName}! 👋</h1>
          <p>सहकार सेवा — What service do you need today?</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="helpline-widget-btn" onClick={() => setShowHelpline(true)} title="Helpline">
            <Phone size={18} />
          </button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/customer/book')}>
            Book a Service
          </Button>
        </div>
      </div>

      {/* Maintenance Reminders */}
      {reminders.length > 0 && (
        <div className="maintenance-reminders animate-fade-in-up">
          <div className="reminders-header">
            <Bell size={18} />
            <h3>Service Reminders</h3>
            <Badge variant="warning" size="sm">{reminders.length}</Badge>
          </div>
          <div className="reminders-list">
            {reminders.map(r => {
              const days = daysUntil(r.next_due_date);
              const isUrgent = days <= 3;
              return (
                <div key={r.id} className={`reminder-item ${isUrgent ? 'urgent' : ''}`}>
                  <span className="reminder-icon">{r.icon}</span>
                  <div className="reminder-info">
                    <strong>{r.service_name}</strong>
                    <p className="text-xs text-muted">
                      {days <= 0 ? '⚠️ Overdue!' : `Due in ${days} day${days !== 1 ? 's' : ''}`} • Every {r.interval_days} days
                    </p>
                  </div>
                  <div className="reminder-actions">
                    <Button variant="primary" size="sm" onClick={() => navigate('/customer/book')}>Book Now</Button>
                    <button className="reminder-dismiss" onClick={() => dismissReminder(r.id)}><X size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Booking Alert */}
      {activeBookings.length > 0 && (
        <Card variant="elevated" className="active-booking-alert animate-fade-in-up stagger-1">
          <div className="alert-content">
            <div className="alert-pulse" />
            <div>
              <h4>Active Booking</h4>
              <p>{activeBookings[0].serviceName} — {activeBookings[0].workerName} is {activeBookings[0].status.replace('-', ' ')}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="primary" size="sm" onClick={() => navigate(`/customer/track/${activeBookings[0].id}`)}>
                📍 Track Live
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/customer/bookings')}>View</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Services Grid */}
      <section className="animate-fade-in-up stagger-2">
        <h2 className="section-title">Available Services</h2>
        <div className="services-grid">
          {mockServices.map((s) => {
            const Icon = iconMap[s.iconComponent] || Wrench;
            return (
              <Card
                key={s.id}
                className="service-card"
                onClick={() => navigate(`/customer/book?service=${s.id}`)}
              >
                <div className="service-icon-wrap" style={{ background: s.color + '15', color: s.color }}>
                  <Icon size={24} />
                </div>
                <h3>{s.name}</h3>
                <p className="service-meta">
                  <span className="text-muted">From ₹{s.basePrice}</span>
                  <Badge variant="default" size="sm">Book →</Badge>
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="animate-fade-in-up stagger-3">
        <div className="section-header">
          <h2 className="section-title">Recent Bookings</h2>
          <button className="see-all-btn" onClick={() => navigate('/customer/history')}>See All →</button>
        </div>
        <div className="bookings-list">
          {bookings.slice(0, 3).map((b) => (
            <Card key={b.id} className="booking-item">
              <div className="booking-item-left">
                <h4>{b.serviceName}</h4>
                <p className="text-xs text-muted"><Clock size={11} /> {b.date} • {b.time}</p>
                <p className="text-xs text-muted"><MapPin size={11} /> {b.address?.split(',')[0]}</p>
              </div>
              <div className="booking-item-right">
                <Badge variant={statusColors[b.status] || 'default'}>{b.status.replace('-', ' ')}</Badge>
                <span className="booking-price font-semibold">₹{b.totalPrice}</span>
                {b.status === 'en-route' && (
                  <button className="track-live-btn" onClick={() => navigate(`/customer/track/${b.id}`)}>
                    📍 Track
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <HelplineModal isOpen={showHelpline} onClose={() => setShowHelpline(false)} role="customer" />
    </div>
  );
}
