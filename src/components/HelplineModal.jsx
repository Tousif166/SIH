import { useState } from 'react';
import { Phone, X, AlertCircle, Headphones, Shield, MessageCircle } from 'lucide-react';
import './HelplineModal.css';

const HELPLINES = [
  { id: 1, label: 'Sahakar Seva Helpline', number: '1800-XXX-SEVA', type: 'toll-free', icon: Headphones, color: '#10b981', desc: '24x7 Toll-Free • Service booking help' },
  { id: 2, label: 'Worker Welfare Helpline', number: '1800-XXX-KAAM', type: 'toll-free', icon: Shield, color: '#3b82f6', desc: '24x7 Toll-Free • Worker rights & safety' },
  { id: 3, label: 'Emergency SOS', number: '112', type: 'emergency', icon: AlertCircle, color: '#ef4444', desc: 'Police / Fire / Medical Emergency' },
  { id: 4, label: 'Consumer Forum', number: '1800-XXX-COURT', type: 'toll-free', icon: MessageCircle, color: '#8b5cf6', desc: 'Dispute resolution & complaints' },
];

export default function HelplineModal({ isOpen, onClose, role = 'customer' }) {
  if (!isOpen) return null;
  return (
    <div className="helpline-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="helpline-modal animate-scale-in">
        <div className="helpline-header">
          <div>
            <h3>📞 Helpline Numbers</h3>
            <p>We're here 24x7 to help you</p>
          </div>
          <button className="helpline-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="helpline-list">
          {HELPLINES.map(h => {
            const Icon = h.icon;
            return (
              <a key={h.id} href={`tel:${h.number.replace(/-/g,'')}`} className="helpline-card">
                <div className="helpline-icon" style={{ background: h.color + '15', color: h.color }}>
                  <Icon size={22} />
                </div>
                <div className="helpline-info">
                  <strong>{h.label}</strong>
                  <p>{h.desc}</p>
                  <span className={`helpline-number ${h.type}`}>{h.number}</span>
                </div>
                <Phone size={18} className="helpline-call-icon" style={{ color: h.color }} />
              </a>
            );
          })}
        </div>

        <div className="helpline-footer">
          <p>🏢 For offline registration visit your nearest <strong>Seva Kendra</strong></p>
        </div>
      </div>
    </div>
  );
}
