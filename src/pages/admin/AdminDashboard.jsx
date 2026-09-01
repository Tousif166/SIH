import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, IndianRupee, AlertTriangle, TrendingUp, ChevronRight, Calendar, UserCheck } from 'lucide-react';
import { mockWorkers } from '../../data/mockWorkers';
import { mockBookings } from '../../data/mockBookings';
import { mockComplaints } from '../../data/mockComplaints';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatsCard from '../../components/ui/StatsCard';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const totalWorkers = mockWorkers.length;
  const activeWorkers = mockWorkers.filter(w => w.available).length;
  const totalBookings = mockBookings.length;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const openComplaints = mockComplaints.filter(c => c.status === 'open').length;
  const completedBookings = mockBookings.filter(b => b.status === 'completed').length;

  return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <h1>{t('dashboard')}</h1>
        <p className="text-muted">{t('overview_desc')}</p>
      </div>

      {/* Stats Grid - 4 cols on desktop, 2x2 on mobile */}
      <div className="admin-stats-grid mb-8">
        <StatsCard 
          label={t('total_workers')} 
          value={totalWorkers} 
          icon={Users} 
          color="primary" 
          subtext={`${activeWorkers} online`} 
        />
        <StatsCard 
          label={t('total_bookings')} 
          value={totalBookings} 
          icon={Briefcase} 
          color="info" 
          subtext={`${completedBookings} completed`} 
        />
        <StatsCard 
          label={t('revenue')} 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={IndianRupee} 
          color="success" 
          trend="up" 
          trendValue="15%" 
        />
        <StatsCard 
          label={t('open_complaints')} 
          value={openComplaints} 
          icon={AlertTriangle} 
          color="danger" 
        />
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions-section mb-8">
        <h2 className="section-title">{t('quick_actions')}</h2>
        <div className="admin-actions">
          <button className="admin-action-btn primary" onClick={() => navigate('/admin/forecast')}>
            <div className="admin-action-icon primary">
              <TrendingUp size={20} />
            </div>
            <div className="admin-action-content">
              <span className="admin-action-title">{t('demand_forecast_ai')}</span>
              <span className="admin-action-sub">Predict demand spikes with AI</span>
            </div>
            <ChevronRight size={18} className="admin-action-arrow" />
          </button>

          <button className="admin-action-btn" onClick={() => navigate('/admin/workers')}>
            <div className="admin-action-icon info">
              <Users size={20} />
            </div>
            <div className="admin-action-content">
              <span className="admin-action-title">{t('manage_workers')}</span>
              <span className="admin-action-sub">{totalWorkers} registered • {activeWorkers} online</span>
            </div>
            <ChevronRight size={18} className="admin-action-arrow" />
          </button>

          <button className="admin-action-btn" onClick={() => navigate('/admin/complaints')}>
            <div className="admin-action-icon danger">
              <AlertTriangle size={20} />
            </div>
            <div className="admin-action-content">
              <span className="admin-action-title">{t('view_complaints')}</span>
              <span className="admin-action-sub">{openComplaints} issues pending review</span>
            </div>
            {openComplaints > 0 && <Badge variant="danger" size="sm">{openComplaints}</Badge>}
            <ChevronRight size={18} className="admin-action-arrow" />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="admin-recent-section">
        <div className="admin-section-header">
          <h2 className="section-title">{t('recent_bookings')}</h2>
          <span className="text-xs text-muted">Showing latest 6</span>
        </div>

        {/* Desktop Table View */}
        <div className="admin-table-card hide-mobile">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Worker</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.slice(0, 6).map(booking => (
                <tr key={booking.id}>
                  <td className="text-muted font-mono">{booking.id}</td>
                  <td className="font-semibold">{booking.serviceName}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.workerName || '—'}</td>
                  <td>
                    <Badge variant={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'} size="sm">
                      {booking.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="font-semibold text-primary">₹{booking.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Booking Cards View */}
        <div className="admin-mobile-bookings-list hide-desktop">
          {mockBookings.slice(0, 6).map(booking => (
            <Card key={booking.id} className="admin-mobile-booking-card" hover>
              <div className="amb-top">
                <div className="amb-service-info">
                  <span className="amb-id font-mono">{booking.id}</span>
                  <h4 className="amb-service-name">{booking.serviceName}</h4>
                </div>
                <Badge variant={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning'} size="sm">
                  {booking.status.replace('-', ' ')}
                </Badge>
              </div>

              <div className="amb-details">
                <div className="amb-detail-row">
                  <span className="text-muted">👤 Customer:</span>
                  <span className="font-medium">{booking.customerName}</span>
                </div>
                <div className="amb-detail-row">
                  <span className="text-muted">🛠️ Worker:</span>
                  <span className="font-medium">{booking.workerName || 'Unassigned'}</span>
                </div>
                {booking.date && (
                  <div className="amb-detail-row">
                    <span className="text-muted">📅 Date:</span>
                    <span>{booking.date}</span>
                  </div>
                )}
              </div>

              <div className="amb-bottom">
                <span className="amb-price-label text-muted text-xs">Total Amount</span>
                <span className="amb-price font-bold">₹{booking.totalPrice}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
