import { useState } from 'react';
import { mockComplaints } from '../../data/mockComplaints';
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './ComplaintsDashboard.css';

export default function ComplaintsDashboard() {
  const [complaints, setComplaints] = useState(mockComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const handleResolve = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
    setSelectedComplaint(null);
  };

  const statusColors = { open: 'danger', 'in-review': 'warning', 'in-progress': 'primary', resolved: 'success' };
  const statusIcons = { open: AlertTriangle, 'in-review': Clock, 'in-progress': Clock, resolved: CheckCircle };

  return (
    <div className="complaints-page">
      <h1>Complaints Dashboard</h1>
      <p className="text-muted mb-6">{complaints.filter(c => c.status === 'open').length} open complaints</p>

      <div className="complaints-list">
        {complaints.map((complaint, idx) => {
          const StatusIcon = statusIcons[complaint.status] || AlertTriangle;
          return (
            <Card key={complaint.id} hover className={`complaint-card animate-fade-in-up stagger-${idx + 1}`}
              onClick={() => setSelectedComplaint(complaint)}>
              <div className="complaint-header">
                <div className="complaint-left">
                  <StatusIcon size={18} style={{ color: complaint.status === 'open' ? 'var(--danger-500)' : complaint.status === 'resolved' ? 'var(--success-500)' : 'var(--warning-500)' }} />
                  <div>
                    <h3>{complaint.subject}</h3>
                    <p className="text-xs text-muted">By {complaint.customerName} • {complaint.date}</p>
                  </div>
                </div>
                <Badge variant={statusColors[complaint.status] || 'default'} size="sm">{complaint.status}</Badge>
              </div>
              <p className="complaint-preview">{complaint.description}</p>
              <div className="complaint-meta">
                <span>Booking: {complaint.bookingId}</span>
                <span>Worker: {complaint.workerName}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title="Complaint Details" size="lg">
        {selectedComplaint && (
          <div className="complaint-detail">
            <div className="complaint-detail-header">
              <Badge variant={statusColors[selectedComplaint.status] || 'default'} size="lg">{selectedComplaint.status}</Badge>
              <h2>{selectedComplaint.subject}</h2>
            </div>
            <div className="complaint-detail-grid">
              <div><strong>Customer:</strong> {selectedComplaint.customerName}</div>
              <div><strong>Worker:</strong> {selectedComplaint.workerName}</div>
              <div><strong>Booking:</strong> {selectedComplaint.bookingId}</div>
              <div><strong>Date:</strong> {selectedComplaint.date}</div>
            </div>
            <div className="complaint-description">
              <h4>Description</h4>
              <p>{selectedComplaint.description}</p>
            </div>
            {selectedComplaint.resolution && (
              <div className="complaint-resolution">
                <h4>Resolution</h4>
                <p>{selectedComplaint.resolution}</p>
              </div>
            )}
            {selectedComplaint.status !== 'resolved' && (
              <div className="complaint-actions">
                <Button variant="success" icon={CheckCircle} onClick={() => handleResolve(selectedComplaint.id)}>
                  Mark as Resolved
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
