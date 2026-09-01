import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsByCustomer } from '../../data/mockBookings';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import { Clock, MapPin, CloudRain, Printer } from 'lucide-react';
import BillReceiptModal from '../../components/BillReceiptModal';
import './BookingHistory.css';

const statusColors = { 'en-route': 'info', 'in-progress': 'warning', completed: 'success', cancelled: 'danger', assigned: 'primary', booked: 'default' };

export default function BookingHistory() {
  const { user } = useAuth();
  const bookings = getBookingsByCustomer(user?.id);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);

  return (
    <div className="history-page">
      <h1>Booking & Invoice History</h1>
      <p className="text-muted mb-6">{bookings.length} bookings total • All services backed by Sahakar Seva Cooperative</p>

      <div className="history-list">
        {bookings.map((booking, idx) => (
          <Card key={booking.id} className={`history-card animate-fade-in-up stagger-${idx + 1}`}>
            <div className="history-header">
              <div>
                <h3>{booking.serviceName}</h3>
                <p className="text-sm text-muted">Booking #{booking.id}</p>
              </div>
              <Badge variant={statusColors[booking.status] || 'default'}>
                {booking.status.replace('-', ' ')}
              </Badge>
            </div>

            <div className="history-details">
              <span><Clock size={14} /> {booking.date} • {booking.time}</span>
              <span><MapPin size={14} /> {booking.address.split(',')[0]}</span>
            </div>

            <p className="history-desc">{booking.description}</p>

            {booking.workerName && (
              <div className="history-worker">
                <span>Worker: <strong>{booking.workerName}</strong></span>
                {booking.workerRating && <StarRating rating={booking.workerRating} size={14} />}
              </div>
            )}

            <div className="history-footer">
              <div className="history-price">
                <span>₹{booking.totalPrice}</span>
                {booking.weatherCondition && booking.weatherCondition !== 'Clear' && (
                  <span className="weather-tag">
                    <CloudRain size={12} /> {booking.weatherCondition}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button 
                  className="text-primary text-sm font-medium hide-print" 
                  onClick={() => setSelectedReceiptBooking(booking)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <Printer size={14} /> Print Bill Receipt
                </button>
                {booking.status === 'completed' && booking.rating && (
                  <div className="history-rating hide-print">
                    <span className="text-xs text-muted">Your rating:</span>
                    <StarRating rating={booking.rating} size={16} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bill Receipt Modal */}
      <BillReceiptModal 
        isOpen={Boolean(selectedReceiptBooking)} 
        onClose={() => setSelectedReceiptBooking(null)} 
        booking={selectedReceiptBooking} 
      />
    </div>
  );
}

