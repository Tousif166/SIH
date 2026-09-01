import { mockWorkers } from '../../data/mockWorkers';
import { Users, CheckCircle, XCircle, Search } from 'lucide-react';
import { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useLanguage } from '../../context/LanguageContext';
import './WorkerManagement.css';

export default function WorkerManagement() {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState(mockWorkers);
  const [search, setSearch] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleBanStatus = (id) => {
    setWorkers(prev => prev.map(w => 
      w.id === id ? { ...w, banned: !w.banned, available: w.banned ? w.available : false } : w
    ));
    if (selectedWorker?.id === id) {
      setSelectedWorker({ ...selectedWorker, banned: !selectedWorker.banned });
    }
  };

  const removeWorker = (id) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    setSelectedWorker(null);
  };

  return (
    <div className="worker-mgmt-page">
      <h1>{t('workers')} Management</h1>
      <p className="text-muted mb-6">{workers.length} workers registered</p>

      <Input
        placeholder="Search by name or skill..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        icon={Search}
        className="mb-6"
      />

      <div className="worker-mgmt-grid">
        {filtered.map((worker, idx) => (
          <Card key={worker.id} hover className={`worker-mgmt-card animate-fade-in-up stagger-${idx + 1}`} onClick={() => setSelectedWorker(worker)}>
            <div className="wm-header">
              <div className="wm-avatar" style={{ background: worker.available ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--gray-300)' }}>
                {worker.name[0]}
              </div>
              <div>
                <h3>{worker.name} {worker.banned && <span className="text-danger text-sm">(Banned)</span>}</h3>
                <StarRating rating={worker.rating} size={14} />
              </div>
              <Badge variant={worker.banned ? 'danger' : worker.available ? 'success' : 'default'} size="sm">
                {worker.banned ? 'Banned' : worker.available ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="wm-details">
              <div className="wm-detail-item">
                <span>Cooperative</span>
                <span>{worker.cooperative}</span>
              </div>
              <div className="wm-detail-item">
                <span>Jobs Done</span>
                <span>{worker.totalJobs}</span>
              </div>
              <div className="wm-detail-item">
                <span>Queue Position</span>
                <span>#{worker.fairnessPosition}</span>
              </div>
              <div className="wm-detail-item">
                <span>Earnings</span>
                <span className="text-success">₹{worker.earnings.toLocaleString()}</span>
              </div>
            </div>

            <div className="wm-skills">
              {worker.skills.map(skill => (
                <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!selectedWorker} onClose={() => setSelectedWorker(null)} title="Worker Details">
        {selectedWorker && (
          <div className="worker-detail-modal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="wm-avatar" style={{ width: 64, height: 64, fontSize: 24, background: selectedWorker.banned ? 'var(--danger-500)' : 'var(--primary-500)' }}>
                {selectedWorker.name[0]}
              </div>
              <div>
                <h2>{selectedWorker.name}</h2>
                <Badge variant={selectedWorker.banned ? 'danger' : 'success'}>
                  {selectedWorker.banned ? 'Banned' : 'Active'}
                </Badge>
              </div>
            </div>
            
            <div className="wm-details mb-6">
              <div className="wm-detail-item"><span>Jobs Done</span><span>{selectedWorker.totalJobs}</span></div>
              <div className="wm-detail-item"><span>Earnings</span><span>₹{selectedWorker.earnings.toLocaleString()}</span></div>
              <div className="wm-detail-item"><span>Rating</span><span>{selectedWorker.rating} ⭐</span></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Button 
                variant={selectedWorker.banned ? 'success' : 'warning'} 
                className="flex-1"
                onClick={() => toggleBanStatus(selectedWorker.id)}
              >
                {selectedWorker.banned ? t('unban_worker') : t('ban_worker')}
              </Button>
              <Button 
                variant="danger" 
                className="flex-1"
                onClick={() => removeWorker(selectedWorker.id)}
              >
                {t('remove_worker')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
