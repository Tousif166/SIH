import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import Card from '../../components/ui/Card';
import './CustomerProfile.css';

export default function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <Card variant="elevated" className="profile-card animate-fade-in-up">
        <div className="profile-header">
          <div className="profile-avatar-large">{user?.name?.[0] || 'U'}</div>
          <h2>{user?.name}</h2>
          <p className="text-muted">Customer Account</p>
        </div>

        <div className="profile-info-list">
          <div className="profile-info-item">
            <Mail size={18} />
            <div>
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
          <div className="profile-info-item">
            <Phone size={18} />
            <div>
              <span className="info-label">Phone</span>
              <span className="info-value">{user?.phone}</span>
            </div>
          </div>
          <div className="profile-info-item">
            <MapPin size={18} />
            <div>
              <span className="info-label">Address</span>
              <span className="info-value">{user?.address}</span>
            </div>
          </div>
          <div className="profile-info-item">
            <Globe size={18} />
            <div>
              <span className="info-label">Language</span>
              <span className="info-value">{user?.language === 'hi' ? 'हिन्दी' : 'English'}</span>
            </div>
          </div>
        </div>
      </Card>

      {user?.savedAddresses && (
        <Card className="animate-fade-in-up stagger-2">
          <h3 className="mb-4">Saved Addresses</h3>
          {user.savedAddresses.map((addr, i) => (
            <div key={i} className="saved-address">
              <MapPin size={16} />
              <div>
                <strong>{addr.label}</strong>
                <p className="text-sm text-muted">{addr.address}</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
