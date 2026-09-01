import { useState } from 'react';
import { mockBookings } from '../../data/mockBookings';
import { MapPin, Clock, IndianRupee, User, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge, { FairnessBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './JobFeed.css';

const availableJobs = [
  { id: 'JOB001', serviceName: 'Plumbing', description: 'Bathroom pipe burst, urgent repair needed', address: 'Sector 22, Gurugram', date: '2026-09-01', time: '11:00 AM', estimatedPay: 450, customerName: 'Amit Singh', customerRating: 4.5, fairnessPosition: 1, urgency: 'high' },
  { id: 'JOB002', serviceName: 'Plumbing', description: 'Kitchen tap replacement', address: 'DLF Phase 3, Gurugram', date: '2026-09-01', time: '2:00 PM', estimatedPay: 350, customerName: 'Neha Gupta', customerRating: 4.8, fairnessPosition: 2, urgency: 'medium' },
  { id: 'JOB003', serviceName: 'Pipe Fitting', description: 'New washing machine inlet pipe installation', address: 'Sushant Lok, Gurugram', date: '2026-09-02', time: '10:00 AM', estimatedPay: 500, customerName: 'Raj Patel', customerRating: 4.2, fairnessPosition: 3, urgency: 'low' },
  { id: 'JOB004', serviceName: 'Plumbing', description: 'Water heater connection repair', address: 'Sector 56, Gurugram', date: '2026-09-02', time: '4:00 PM', estimatedPay: 400, customerName: 'Sita Devi', customerRating: 4.9, fairnessPosition: 4, urgency: 'medium' }
];

export default function JobFeed() {
  const [jobs, setJobs] = useState(availableJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [accepted, setAccepted] = useState(null);

  const handleAccept = (job) => {
    setAccepted(job.id);
    setShowAcceptModal(false);
    setTimeout(() => setJobs(j => j.filter(x => x.id !== job.id)), 1500);
  };

  return (
    <div className="job-feed-page">
      <h1>Available Jobs</h1>
      <p className="text-muted mb-6">{jobs.length} jobs available • Sorted by fairness queue</p>

      <div className="job-feed-list">
        {jobs.map((job, idx) => (
          <Card key={job.id} hover className={`job-card animate-fade-in-up stagger-${idx + 1} ${accepted === job.id ? 'job-accepted' : ''}`}>
            <div className="job-card-header">
              <div>
                <h3>{job.serviceName}</h3>
                <FairnessBadge position={job.fairnessPosition} />
              </div>
              <Badge variant={job.urgency === 'high' ? 'danger' : job.urgency === 'medium' ? 'warning' : 'default'} size="sm">
                {job.urgency} priority
              </Badge>
            </div>

            <p className="job-description">{job.description}</p>

            <div className="job-meta">
              <span><MapPin size={14} /> {job.address}</span>
              <span><Clock size={14} /> {job.date} • {job.time}</span>
              <span><User size={14} /> {job.customerName} (⭐ {job.customerRating})</span>
            </div>

            <div className="job-footer">
              <span className="job-pay"><IndianRupee size={16} /> {job.estimatedPay}</span>
              <div className="job-actions">
                <Button variant="ghost" size="sm" icon={XCircle}>Decline</Button>
                <Button variant="success" size="sm" icon={CheckCircle}
                  onClick={() => { setSelectedJob(job); setShowAcceptModal(true); }}>
                  Accept
                </Button>
              </div>
            </div>

            {accepted === job.id && (
              <div className="accepted-overlay">
                <CheckCircle size={32} />
                <span>Job Accepted!</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={showAcceptModal} onClose={() => setShowAcceptModal(false)} title="Accept Job?">
        {selectedJob && (
          <div className="accept-modal-content">
            <h3>{selectedJob.serviceName}</h3>
            <p>{selectedJob.description}</p>
            <div className="accept-details">
              <div><strong>Customer:</strong> {selectedJob.customerName}</div>
              <div><strong>Location:</strong> {selectedJob.address}</div>
              <div><strong>Time:</strong> {selectedJob.date} at {selectedJob.time}</div>
              <div><strong>Estimated Pay:</strong> ₹{selectedJob.estimatedPay}</div>
            </div>
            <div className="accept-actions">
              <Button variant="ghost" onClick={() => setShowAcceptModal(false)}>Cancel</Button>
              <Button variant="success" onClick={() => handleAccept(selectedJob)}>Confirm Accept</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
