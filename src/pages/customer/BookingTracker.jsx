import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookingsByCustomer } from '../../data/mockBookings';
import { Phone, Video, MapPin, Navigation, Printer, Receipt, ShieldCheck } from 'lucide-react';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Card from '../../components/ui/Card';
import Badge, { FairnessBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import Modal from '../../components/ui/Modal';
import BillReceiptModal from '../../components/BillReceiptModal';
import './BookingTracker.css';

const statusColors = {
  'en-route': 'info',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
  assigned: 'primary',
  booked: 'default'
};

export default function BookingTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bookings = getBookingsByCustomer(user?.id);
  const [selectedBooking, setSelectedBooking] = useState(bookings[0] || null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  const canTrack = selectedBooking && ['en-route', 'in-progress', 'assigned'].includes(selectedBooking.status);

  return (
    <div className="tracker-page">
      <div className="tracker-header-row">
        <div>
          <h1>My Bookings & Invoices</h1>
          <p className="text-sm text-muted">Track active worker progress and print tax receipts</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/customer/book')}>
          + Book New Service
        </Button>
      </div>

      <div className="tracker-layout">
        {/* Booking List */}
        <div className="booking-list-panel">
          {bookings.length === 0 ? (
            <Card className="tracker-booking-card p-6 text-center">
              <p className="text-muted mb-4">You have no active bookings.</p>
              <Button variant="primary" onClick={() => navigate('/customer/book')}>Book a Service</Button>
            </Card>
          ) : (
            bookings.map(booking => (
              <Card
                key={booking.id}
                className={`tracker-booking-card ${selectedBooking?.id === booking.id ? 'selected' : ''}`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="tracker-card-top">
                  <h4>{booking.serviceName}</h4>
                  <Badge variant={statusColors[booking.status] || 'default'} size="sm">
                    {booking.status.replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{booking.date} • ₹{booking.totalPrice}</p>
                {booking.workerName && (
                  <p className="text-xs text-muted">Worker: {booking.workerName}</p>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Booking Detail */}
        {selectedBooking && (
          <div className="booking-detail-panel animate-fade-in">
            <Card variant="elevated" padding="lg">
              <div className="booking-detail-header">
                <div>
                  <span className="font-mono text-xs text-muted">Booking Reference: #{selectedBooking.id}</span>
                  <h3>{selectedBooking.serviceName}</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={Printer}
                  onClick={() => setShowReceiptModal(true)}
                >
                  Print Bill Receipt
                </Button>
              </div>

              <StatusTimeline currentStatus={selectedBooking.status} />

              {/* Worker Info */}
              {selectedBooking.workerName && (
                <div className="worker-info-card">
                  <div className="worker-avatar">{selectedBooking.workerName[0]}</div>
                  <div className="worker-details">
                    <h4>{selectedBooking.workerName}</h4>
                    <StarRating rating={selectedBooking.workerRating || 4.8} size={14} />
                    {selectedBooking.fairnessPosition && (
                      <FairnessBadge position={selectedBooking.fairnessPosition} />
                    )}
                  </div>
                  <div className="worker-actions">
                    <a href={`tel:${selectedBooking.workerPhone || '9876543210'}`} className="contact-btn" title="Call worker">
                      <Phone size={18} />
                    </a>
                    <button className="contact-btn" onClick={() => setShowVideoModal(true)} title="Video call">
                      <Video size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Track Worker Button */}
              {canTrack && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={Navigation}
                  className="w-full track-btn"
                  onClick={() => navigate(`/customer/track/${selectedBooking.id}`)}
                >
                  🗺️ Track Worker Live on Map
                </Button>
              )}

              {/* Booking Details */}
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Service</span>
                  <span className="detail-value">{selectedBooking.serviceName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date & Time</span>
                  <span className="detail-value">{selectedBooking.date} • {selectedBooking.time}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{selectedBooking.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description</span>
                  <span className="detail-value">{selectedBooking.description}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Price (GST Incl.)</span>
                  <span className="detail-value detail-price">₹{selectedBooking.totalPrice}</span>
                </div>
                {selectedBooking.weatherCondition && selectedBooking.weatherCondition !== 'Clear' && (
                  <div className="detail-item weather-detail">
                    <span className="detail-label">Weather Adjustment</span>
                    <span className="detail-value">
                      {selectedBooking.weatherCondition} (×{selectedBooking.weatherMultiplier || 1.2})
                    </span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {selectedBooking.status === 'completed' && !selectedBooking.rating && (
                <div className="rating-section">
                  <h4>Rate this service</h4>
                  <StarRating rating={ratingValue} interactive onRate={setRatingValue} size={28} />
                  {ratingValue > 0 && (
                    <Button variant="primary" size="sm" onClick={() => alert('Thank you for rating your cooperative worker!')}>
                      Submit Rating
                    </Button>
                  )}
                </div>
              )}
              {selectedBooking.rating && (
                <div className="rating-section">
                  <h4>Your Rating</h4>
                  <StarRating rating={selectedBooking.rating} size={24} />
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Bill Receipt Modal */}
      <BillReceiptModal 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        booking={selectedBooking} 
      />

      {/* Video Call Modal */}
      <Modal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} title="Video Call">
        <div className="video-placeholder">
          <Video size={48} />
          <h3>Video Call with Cooperative Pro</h3>
          <p>You can connect directly with {selectedBooking?.workerName || 'your worker'} or call on mobile.</p>
          <Badge variant="info" size="lg">Ready to Connect</Badge>
        </div>
      </Modal>
    </div>
  );
}

