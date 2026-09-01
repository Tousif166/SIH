import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockWorkers } from '../../data/mockWorkers';
import { Calendar, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import './LeaveRequests.css';

export default function LeaveRequests() {
  const { user } = useAuth();
  const worker = mockWorkers.find(w => w.id === user?.id) || mockWorkers[0];
  const [showModal, setShowModal] = useState(false);
  const [leaves, setLeaves] = useState(worker.leaveRequests || []);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });

  const handleSubmit = () => {
    setLeaves(prev => [...prev, { id: `lr-${Date.now()}`, ...form, status: 'pending' }]);
    setShowModal(false);
    setForm({ startDate: '', endDate: '', reason: '' });
  };

  const statusColors = { approved: 'success', pending: 'warning', rejected: 'danger' };

  return (
    <div className="leave-page">
      <div className="leave-header">
        <h1>Leave Requests</h1>
        <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>Request Leave</Button>
      </div>

      <div className="leave-list">
        {leaves.length === 0 ? (
          <Card className="empty-state"><p>No leave requests yet.</p></Card>
        ) : (
          leaves.map((leave, i) => (
            <Card key={leave.id} className={`leave-card animate-fade-in-up stagger-${i + 1}`}>
              <div className="leave-card-header">
                <div className="leave-dates">
                  <Calendar size={16} />
                  <span>{leave.startDate} → {leave.endDate}</span>
                </div>
                <Badge variant={statusColors[leave.status]}>{leave.status}</Badge>
              </div>
              <p className="leave-reason">{leave.reason}</p>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Request Leave">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
          <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required />
          <Input label="Reason" placeholder="Why do you need leave?" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required />
          <Button variant="primary" onClick={handleSubmit} disabled={!form.startDate || !form.endDate || !form.reason}>Submit Request</Button>
        </div>
      </Modal>
    </div>
  );
}
