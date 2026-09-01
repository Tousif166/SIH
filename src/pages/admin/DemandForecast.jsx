import { useState, useMemo, useRef, useEffect } from 'react';
import { generateForecast, generateCategoryForecast, generateZoneForecast, getStaffingRecommendations } from '../../utils/forecastEngine';
import { historicalDemand } from '../../data/mockHistoricalDemand';
import { mockWorkers } from '../../data/mockWorkers';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, CloudRain, Sun, Thermometer, Calendar, Users, BarChart3, MapPin, Brain, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatsCard from '../../components/ui/StatsCard';
import './DemandForecast.css';

const CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', emoji: '🔧', color: '#3b82f6' },
  { id: 'electrical', name: 'Electrical', emoji: '⚡', color: '#f59e0b' },
  { id: 'cleaning', name: 'Cleaning', emoji: '🧹', color: '#10b981' },
  { id: 'painting', name: 'Painting', emoji: '🎨', color: '#8b5cf6' },
  { id: 'carpentry', name: 'Carpentry', emoji: '🔨', color: '#ef4444' },
  { id: 'ac-repair', name: 'AC Repair', emoji: '❄️', color: '#06b6d4' },
  { id: 'pest-control', name: 'Pest Control', emoji: '🐛', color: '#84cc16' },
  { id: 'appliance-repair', name: 'Appliance', emoji: '⚙️', color: '#6366f1' }
];

const weatherIcons = { Rainy: CloudRain, Hot: Thermometer, Clear: Sun };

export default function DemandForecast() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [forecastDays, setForecastDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const chartRef = useRef(null);

  // Generate forecasts
  const aggregateForecast = useMemo(() => generateForecast(historicalDemand, forecastDays), [forecastDays]);

  const categoryForecast = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return generateCategoryForecast(historicalDemand, selectedCategory, forecastDays);
  }, [selectedCategory, forecastDays]);

  const zoneForecast = useMemo(() => generateZoneForecast(historicalDemand), []);

  // Available workers per category
  const availableByCategory = useMemo(() => {
    const counts = {};
    mockWorkers.forEach(w => {
      if (w.available) {
        w.skills.forEach(skill => {
          const cat = skill.toLowerCase().replace(' repair', '-repair').replace(' control', '-control');
          counts[cat] = (counts[cat] || 0) + 1;
        });
      }
    });
    return counts;
  }, []);

  const staffingRecs = useMemo(() => getStaffingRecommendations(aggregateForecast, availableByCategory), [aggregateForecast, availableByCategory]);

  const activeForecast = selectedCategory === 'all' ? aggregateForecast : categoryForecast;
  const totalPredicted = activeForecast?.reduce((sum, d) => sum + d.predicted, 0) || 0;
  const avgPredicted = activeForecast?.length ? Math.round(totalPredicted / activeForecast.length) : 0;
  const peakDay = activeForecast?.reduce((max, d) => d.predicted > max.predicted ? d : max, activeForecast[0]);

  // Simulated regeneration
  const handleRegenerate = () => {
    setIsGenerating(true);
    setShowResults(false);
    setTimeout(() => { setIsGenerating(false); setShowResults(true); }, 1500);
  };

  // Draw chart on canvas
  useEffect(() => {
    if (!chartRef.current || !activeForecast?.length) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 280 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '280px';
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = 280;
    const padding = { top: 30, right: 30, bottom: 50, left: 55 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, W, H);

    const values = activeForecast.map(d => d.predicted);
    const highs = activeForecast.map(d => d.confidence[1]);
    const lows = activeForecast.map(d => d.confidence[0]);
    const maxVal = Math.max(...highs) * 1.1;
    const minVal = Math.max(0, Math.min(...lows) * 0.8);
    const range = maxVal - minVal || 1;

    const xStep = chartW / Math.max(activeForecast.length - 1, 1);
    const toX = (i) => padding.left + i * xStep;
    const toY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxVal - (range / 4) * i);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Confidence band
    ctx.beginPath();
    activeForecast.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.confidence[1]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    for (let i = activeForecast.length - 1; i >= 0; i--) {
      ctx.lineTo(toX(i), toY(activeForecast[i].confidence[0]));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    activeForecast.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.predicted);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Data points
    activeForecast.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.predicted);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = d.festival ? '#f59e0b' : '#6366f1';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.predicted, x, y - 12);

      // X-axis labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(d.dayName, x, H - padding.bottom + 18);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(d.date.slice(5), x, H - padding.bottom + 32);
    });

    // Chart title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Predicted Demand (Workers Needed)', padding.left, 18);

  }, [activeForecast, showResults]);

  return (
    <div className="forecast-page">
      {/* Header */}
      <div className="forecast-header">
        <div>
          <h1>🤖 AI Demand Forecast</h1>
          <p className="text-muted">Powered by Weighted Moving Average + Seasonality + Weather Analysis</p>
        </div>
        <Button
          variant="primary"
          icon={RefreshCw}
          loading={isGenerating}
          onClick={handleRegenerate}
        >
          Regenerate
        </Button>
      </div>

      {/* Category Selector */}
      <div className="category-selector">
        <button
          className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <BarChart3 size={16} /> All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={selectedCategory === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
          >
            <span>{cat.emoji}</span> {cat.name}
          </button>
        ))}
      </div>

      {showResults && (
        <div className="forecast-content animate-fade-in-up">
          {/* Stats */}
          <div className="grid grid-4 gap-4 mb-8">
            <StatsCard label="Avg. Daily Demand" value={avgPredicted} icon={TrendingUp} color="primary" />
            <StatsCard label="Total (7 Days)" value={totalPredicted} icon={BarChart3} color="info" />
            <StatsCard label="Peak Day" value={`${peakDay?.dayName} (${peakDay?.predicted})`} icon={Calendar} color="warning" />
            <StatsCard label="Workers Online" value={mockWorkers.filter(w => w.available).length} icon={Users} color="success" />
          </div>

          {/* Chart */}
          <Card variant="elevated" className="chart-card mb-8 animate-fade-in-up stagger-1">
            <div className="chart-container">
              <canvas ref={chartRef} />
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#6366f1' }} />
                Predicted Demand
              </span>
              <span className="legend-item">
                <span className="legend-band" />
                Confidence Band
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }} />
                Festival Impact
              </span>
            </div>
          </Card>

          {/* Daily Breakdown Table */}
          <Card variant="elevated" className="mb-8 animate-fade-in-up stagger-2">
            <h3 className="card-section-title">
              <Calendar size={18} /> Daily Breakdown
            </h3>
            <div className="forecast-table-wrap">
              <table className="forecast-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Predicted</th>
                    <th>Confidence Range</th>
                    {activeForecast?.[0]?.weather && <th>Weather</th>}
                    {activeForecast?.[0]?.festival !== undefined && <th>Festival</th>}
                  </tr>
                </thead>
                <tbody>
                  {activeForecast?.map((day, i) => {
                    const WeatherIcon = weatherIcons[day.weather] || Sun;
                    return (
                      <tr key={i}>
                        <td className="font-semibold">{day.dayName}</td>
                        <td>{day.date}</td>
                        <td>
                          <span className="predicted-value">{day.predicted}</span>
                        </td>
                        <td className="text-muted">{day.confidence[0]} — {day.confidence[1]}</td>
                        {day.weather && (
                          <td>
                            <span className={`weather-badge weather-${day.weather.toLowerCase()}`}>
                              <WeatherIcon size={14} /> {day.weather}
                            </span>
                          </td>
                        )}
                        {day.festival !== undefined && (
                          <td>
                            {day.festival ? (
                              <Badge variant="warning" size="sm">🎉 {day.festival}</Badge>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Staffing Recommendations */}
          <Card variant="elevated" className="mb-8 animate-fade-in-up stagger-3">
            <h3 className="card-section-title">
              <Brain size={18} /> AI Staffing Recommendations
            </h3>
            <div className="staffing-grid">
              {staffingRecs.map((rec, i) => {
                const cat = CATEGORIES.find(c => c.id === rec.category);
                return (
                  <div key={rec.category} className={`staffing-card urgency-${rec.urgency}`}>
                    <div className="staffing-card-header">
                      <span className="staffing-emoji">{cat?.emoji || '📋'}</span>
                      <h4>{rec.categoryName}</h4>
                      <Badge
                        variant={rec.urgency === 'understaffed' ? 'danger' : rec.urgency === 'tight' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {rec.urgency === 'understaffed' ? '⚠️ Understaffed' : rec.urgency === 'tight' ? '⏳ Tight' : '✅ Covered'}
                      </Badge>
                    </div>
                    <div className="staffing-bar-container">
                      <div className="staffing-bar">
                        <div
                          className="staffing-bar-fill"
                          style={{
                            width: `${Math.min((rec.available / Math.max(rec.peakDemand, 1)) * 100, 100)}%`,
                            background: rec.urgency === 'understaffed' ? 'var(--danger-500)' : rec.urgency === 'tight' ? 'var(--warning-500)' : 'var(--success-500)'
                          }}
                        />
                      </div>
                      <span className="staffing-ratio">{rec.available}/{rec.peakDemand}</span>
                    </div>
                    <p className="staffing-message">{rec.message}</p>
                    {rec.gap > 0 && (
                      <div className="staffing-gap">
                        <AlertTriangle size={14} />
                        Need <strong>{rec.gap}</strong> more workers
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Zone Demand Heatmap */}
          <Card variant="elevated" className="animate-fade-in-up stagger-4">
            <h3 className="card-section-title">
              <MapPin size={18} /> Zone-wise Demand Heatmap
            </h3>
            <div className="zone-grid">
              {Object.entries(zoneForecast).sort((a, b) => b[1] - a[1]).map(([zone, demand], i) => {
                const maxDemand = Math.max(...Object.values(zoneForecast));
                const intensity = demand / maxDemand;
                return (
                  <div
                    key={zone}
                    className="zone-card"
                    style={{
                      background: `rgba(99, 102, 241, ${0.05 + intensity * 0.2})`,
                      borderColor: `rgba(99, 102, 241, ${0.1 + intensity * 0.4})`
                    }}
                  >
                    <div className="zone-name">{zone}</div>
                    <div className="zone-demand">{demand}</div>
                    <div className="zone-bar">
                      <div className="zone-bar-fill" style={{ width: `${intensity * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {isGenerating && (
        <div className="generating-overlay animate-fade-in">
          <div className="generating-spinner">
            <Brain size={32} />
          </div>
          <h3>Analyzing demand patterns...</h3>
          <p>Running AI forecasting model with weather, seasonality, and festival data</p>
        </div>
      )}
    </div>
  );
}
