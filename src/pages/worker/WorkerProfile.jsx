import { useAuth } from '../../context/AuthContext';
import { mockWorkers } from '../../data/mockWorkers';
import { Mail, Phone, Award, Calendar, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import '../customer/CustomerProfile.css';

export default function WorkerProfile() {
  const { user } = useAuth();
  const worker = mockWorkers.find(w => w.id === user?.id) || mockWorkers[0];

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <Card variant="elevated" className="profile-card animate-fade-in-up">
        <div className="profile-header">
          <div className="profile-avatar-large" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {worker.name[0]}
          </div>
          <h2>{worker.name}</h2>
          <StarRating rating={worker.rating} size={18} />
          <p className="text-muted">{worker.totalJobs} jobs completed</p>
        </div>

        <div className="profile-info-list">
          <div className="profile-info-item"><Mail size={18} /><div><span className="info-label">Email</span><span className="info-value">{worker.email}</span></div></div>
          <div className="profile-info-item"><Phone size={18} /><div><span className="info-label">Phone</span><span className="info-value">{worker.phone}</span></div></div>
          <div className="profile-info-item"><Users size={18} /><div><span className="info-label">Cooperative</span><span className="info-value">{worker.cooperative}</span></div></div>
          <div className="profile-info-item"><Calendar size={18} /><div><span className="info-label">Joined</span><span className="info-value">{worker.joinDate}</span></div></div>
        </div>
      </Card>

      {/* Skills */}
      <Card className="animate-fade-in-up stagger-2">
        <h3 className="mb-4">Skills</h3>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {worker.skills.map(skill => (
            <Badge key={skill} variant="primary" size="md">{skill}</Badge>
          ))}
        </div>
      </Card>

      {/* Certificates */}
      <Card className="animate-fade-in-up stagger-3 mt-4">
        <h3 className="mb-4">Certificates</h3>
        {worker.certificates.map((cert, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: i < worker.certificates.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
            <Award size={18} style={{ color: 'var(--accent-500)' }} />
            <div>
              <strong style={{ fontSize: 'var(--fs-sm)' }}>{cert.name}</strong>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--gray-500)' }}>{cert.issuer} • {cert.date}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
