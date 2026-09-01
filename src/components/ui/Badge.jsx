import './Badge.css';

export default function Badge({ children, variant = 'default', size = 'md', icon: Icon, pulse = false, className = '' }) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${pulse ? 'badge-pulse' : ''} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
}

export function FairnessBadge({ position }) {
  return (
    <span className="fairness-badge" title="Fairness queue position">
      <span className="fairness-badge-icon">⚖️</span>
      <span>#{position} in fair queue</span>
    </span>
  );
}
