import { useEffect, useState } from 'react';
import './StatsCard.css';

export default function StatsCard({ label, value, icon: Icon, trend, trendValue, color = 'primary' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animated counter
    const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
    if (numValue === 0) { setDisplayValue(value); return; }

    const duration = 1000;
    const steps = 30;
    const increment = numValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), numValue);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val) => {
    if (typeof val === 'string') return val;
    if (val >= 10000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-header">
        <span className="stats-card-label">{label}</span>
        {Icon && (
          <div className={`stats-card-icon stats-icon-${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stats-card-value">{formatValue(displayValue)}</div>
      {trend && (
        <div className={`stats-card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
          <span>{trend === 'up' ? '↑' : '↓'} {trendValue}</span>
          <span className="trend-label">vs last week</span>
        </div>
      )}
    </div>
  );
}
