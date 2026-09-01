import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  User, 
  Clock, 
  MapPin, 
  Home,
  CheckCircle2, 
  Navigation, 
  Compass, 
  ShieldCheck, 
  Volume2, 
  Share2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { mockBookings } from '../../data/mockBookings';
import { mockWorkers } from '../../data/mockWorkers';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useLanguage } from '../../context/LanguageContext';
import './LiveTrackingMap.css';

// Realistic route to Customer's Home (Sector 14, Gurugram NCR)
const CUSTOMER_ROUTE = [
  { lat: 28.4550, lng: 77.0220, street: 'Cooperative Service Hub', statusMsg: 'Worker started from Cooperative Hub' },
  { lat: 28.4580, lng: 77.0245, street: 'Sector 14 Main Road', statusMsg: 'Worker is driving along Sector 14 Main Road' },
  { lat: 28.4610, lng: 77.0270, street: 'MG Road Junction', statusMsg: 'Passing MG Road Junction • Normal traffic' },
  { lat: 28.4645, lng: 77.0298, street: 'Central Market Road', statusMsg: 'Worker is crossing Central Market' },
  { lat: 28.4680, lng: 77.0325, street: 'Block C Avenue', statusMsg: 'Approaching your neighborhood (Block C)' },
  { lat: 28.4715, lng: 77.0355, street: 'Sahakar Marg', statusMsg: 'Worker is 500m away on Sahakar Marg' },
  { lat: 28.4740, lng: 77.0375, street: 'Society Main Gate', statusMsg: 'Worker reached Society Main Gate' },
  { lat: 28.4760, lng: 77.0385, street: 'Green Valley Apartments Lane', statusMsg: 'Worker is entering your apartment building' },
  { lat: 28.4770, lng: 77.0390, street: 'Your Home', statusMsg: 'Worker has arrived at your doorstep!' },
];

// Bearing calculator
function calculateBearing(startLat, startLng, endLat, endLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;

  const dLng = endLngRad - startLngRad;
  const y = Math.sin(dLng) * Math.cos(endLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Micro-interpolation for 60fps smooth animation
function interpolateRoute(points, stepsPerSegment = 35) {
  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const bearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);
    
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const lat = p1.lat + (p2.lat - p1.lat) * t;
      const lng = p1.lng + (p2.lng - p1.lng) * t;
      result.push({
        lat,
        lng,
        bearing,
        street: p1.street,
        statusMsg: p1.statusMsg,
        segmentIndex: i,
        totalProgress: ((i * stepsPerSegment + s) / ((points.length - 1) * stepsPerSegment)) * 100
      });
    }
  }
  const last = points[points.length - 1];
  result.push({
    lat: last.lat,
    lng: last.lng,
    bearing: 0,
    street: last.street,
    statusMsg: last.statusMsg,
    segmentIndex: points.length - 1,
    totalProgress: 100
  });
  return result;
}

export default function LiveTrackingMap() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const mapContainerRef = useRef(null);
  const leafletMap = useRef(null);
  const workerMarker = useRef(null);
  const customerMarker = useRef(null);
  const routePolylineBack = useRef(null);
  const routePolylineFront = useRef(null);
  const traversedPolyline = useRef(null);

  const [simIndex, setSimIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraMode, setCameraMode] = useState('overview'); // 'overview' | 'worker' | 'home'

  // Booking & Worker
  const booking = mockBookings.find(b => b.id === bookingId) ||
    mockBookings.find(b => b.status === 'en-route') ||
    mockBookings[0];
  const worker = mockWorkers.find(w => w.id === booking?.workerId) || mockWorkers[0];

  const customerHomePos = CUSTOMER_ROUTE[CUSTOMER_ROUTE.length - 1];
  const interpolatedRoute = useMemo(() => interpolateRoute(CUSTOMER_ROUTE, 35), []);
  const currentPoint = interpolatedRoute[simIndex] || interpolatedRoute[0];
  const isArrived = simIndex >= interpolatedRoute.length - 1;
  const progressPercent = Math.round(currentPoint.totalProgress);

  // Distance & ETA in Customer Perspective
  const totalDistanceMeters = 2400;
  const remainingDistanceMeters = Math.max(0, Math.round(totalDistanceMeters * (1 - progressPercent / 100)));
  const etaMinutes = isArrived ? 0 : Math.max(1, Math.ceil(remainingDistanceMeters / 320));

  // Initialize Free OpenStreetMap Leaflet Map (Zero API Key Needed)
  useEffect(() => {
    if (!mapContainerRef.current || leafletMap.current) return;

    // 100% Free OpenStreetMap public tiles without any API key or token requirement
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([28.4660, 77.0305], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const fullLatLngs = CUSTOMER_ROUTE.map(p => [p.lat, p.lng]);
    const destination = [customerHomePos.lat, customerHomePos.lng];

    // Glow border for Google Maps route line
    routePolylineBack.current = L.polyline(fullLatLngs, {
      color: '#1557B0',
      weight: 8,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Google Maps Navigation Blue Route
    routePolylineFront.current = L.polyline(fullLatLngs, {
      color: '#1A73E8',
      weight: 5,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Traveled path
    traversedPolyline.current = L.polyline([], {
      color: '#80868B',
      weight: 5,
      opacity: 0.6,
      lineCap: 'round'
    }).addTo(map);

    // Customer Home Destination Pin (Google Maps Red Home Pin)
    const homeIcon = L.divIcon({
      className: 'gmaps-customer-home-wrap',
      html: `
        <div class="gmaps-customer-home-pin">
          <div class="gmaps-home-bubble">
            <span class="gmaps-home-icon">🏠</span>
            <span class="gmaps-home-label">Your Home</span>
          </div>
          <div class="gmaps-home-point"></div>
          <div class="gmaps-home-pulse"></div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 50]
    });

    customerMarker.current = L.marker(destination, { icon: homeIcon })
      .addTo(map)
      .bindPopup(`<b>Your Address</b><br/>${booking.address || 'Green Valley Apts, Sector 14'}`);

    // Worker Moving Puck with Real-time Direction Arrow
    const workerPuckIcon = L.divIcon({
      className: 'gmaps-worker-puck-wrap',
      html: `
        <div class="gmaps-puck-container" id="gmaps-worker-puck">
          <div class="gmaps-puck-pulse"></div>
          <div class="gmaps-puck-body">
            <span class="gmaps-worker-vehicle-icon">🛵</span>
          </div>
          <div class="gmaps-worker-tag">${worker.name.split(' ')[0]}</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    workerMarker.current = L.marker([CUSTOMER_ROUTE[0].lat, CUSTOMER_ROUTE[0].lng], {
      icon: workerPuckIcon,
      zIndexOffset: 1000
    }).addTo(map);

    leafletMap.current = map;

    // Center on route overview initially
    map.fitBounds(routePolylineFront.current.getBounds(), {
      padding: [45, 45],
      maxZoom: 15
    });

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Smooth Animation Loop
  useEffect(() => {
    if (!isPlaying || isArrived) return;

    const interval = setInterval(() => {
      setSimIndex(prev => {
        if (prev < interpolatedRoute.length - 1) {
          return prev + 1;
        }
        setIsPlaying(false);
        return prev;
      });
    }, 130);

    return () => clearInterval(interval);
  }, [isPlaying, isArrived, interpolatedRoute.length]);

  // Update map marker positions and camera modes
  useEffect(() => {
    if (!leafletMap.current || !workerMarker.current || !currentPoint) return;

    const latlng = [currentPoint.lat, currentPoint.lng];
    workerMarker.current.setLatLng(latlng);

    // Update traveled line
    if (traversedPolyline.current) {
      const traveledPoints = interpolatedRoute.slice(0, simIndex + 1).map(p => [p.lat, p.lng]);
      traversedPolyline.current.setLatLngs(traveledPoints);
    }

    // Dynamic Camera Tracking
    if (cameraMode === 'worker') {
      leafletMap.current.panTo(latlng, { animate: true, duration: 0.2 });
    } else if (cameraMode === 'home') {
      leafletMap.current.panTo([customerHomePos.lat, customerHomePos.lng], { animate: true, duration: 0.2 });
    }
  }, [simIndex, currentPoint, cameraMode, interpolatedRoute]);

  const handleFitOverview = () => {
    setCameraMode('overview');
    if (leafletMap.current && routePolylineFront.current) {
      leafletMap.current.fitBounds(routePolylineFront.current.getBounds(), {
        padding: [40, 40],
        animate: true
      });
    }
  };

  const handleFocusWorker = () => {
    setCameraMode('worker');
    if (leafletMap.current && currentPoint) {
      leafletMap.current.setView([currentPoint.lat, currentPoint.lng], 16, { animate: true });
    }
  };

  const handleFocusHome = () => {
    setCameraMode('home');
    if (leafletMap.current) {
      leafletMap.current.setView([customerHomePos.lat, customerHomePos.lng], 16, { animate: true });
    }
  };

  const handleResetRoute = () => {
    setSimIndex(0);
    setIsPlaying(true);
    handleFitOverview();
  };

  return (
    <div className="gmaps-tracking-page">
      {/* Top Customer App Bar */}
      <div className="gmaps-top-bar">
        <button className="gmaps-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div className="gmaps-top-title">
          <h3>Track Your Service Professional</h3>
          <span className="text-xs text-muted">{booking?.serviceName} • Booking ID: #{booking?.id}</span>
        </div>
        <Badge variant={isArrived ? 'success' : 'primary'} pulse={!isArrived}>
          {isArrived ? 'Arrived at Doorstep ✓' : 'On The Way'}
        </Badge>
      </div>

      {/* Main Map Viewport */}
      <div className="gmaps-map-viewport">
        {/* Customer Status Banner (Perspective: Customer waiting for worker) */}
        <div className={`gmaps-customer-status-banner ${isArrived ? 'arrived' : ''}`}>
          <div className="gmaps-status-icon-wrap">
            {isArrived ? <CheckCircle2 size={24} color="#10b981" /> : <Navigation size={24} color="#1a73e8" />}
          </div>
          <div className="gmaps-status-text-wrap">
            <h4 className="gmaps-status-title">
              {isArrived 
                ? `${worker.name} has arrived at your address!` 
                : `${worker.name} is on the way to your home`}
            </h4>
            <p className="gmaps-status-subtitle">{currentPoint.statusMsg}</p>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div 
          ref={mapContainerRef} 
          className="gmaps-leaflet-canvas"
          onMouseDown={() => setCameraMode('manual')}
          onTouchStart={() => setCameraMode('manual')}
        />

        {/* Floating Customer Map Controls */}
        <div className="gmaps-customer-camera-controls">
          <button 
            className={`gmaps-camera-btn ${cameraMode === 'overview' ? 'active' : ''}`}
            onClick={handleFitOverview}
            title="View Full Route"
          >
            🗺️ Route View
          </button>
          <button 
            className={`gmaps-camera-btn ${cameraMode === 'worker' ? 'active' : ''}`}
            onClick={handleFocusWorker}
            title="Follow Worker"
          >
            🛵 Track Worker
          </button>
          <button 
            className={`gmaps-camera-btn ${cameraMode === 'home' ? 'active' : ''}`}
            onClick={handleFocusHome}
            title="Focus on My Home"
          >
            🏠 My Home
          </button>
        </div>

        {/* Live Distance Pill Badge */}
        <div className="gmaps-live-pill">
          <span className="gmaps-live-pulse-dot" />
          <span>{isArrived ? 'REACHED' : `${remainingDistanceMeters}m AWAY`}</span>
        </div>
      </div>

      {/* Customer Live Bottom Sheet */}
      <div className="gmaps-bottom-sheet">
        {/* Arrival ETA & Distance Card */}
        <div className="gmaps-eta-card">
          <div className="gmaps-eta-left">
            <div className="gmaps-eta-time-row">
              <span className="gmaps-eta-time">{isArrived ? 'Arrived!' : `${etaMinutes} mins`}</span>
              <span className="gmaps-eta-badge">{isArrived ? 'At Doorstep' : 'Estimated Arrival'}</span>
            </div>
            <span className="gmaps-eta-sub">
              📍 Delivering to: <strong>{booking.address || 'Green Valley Apts, Sector 14'}</strong>
            </span>
          </div>

          <div className="gmaps-eta-actions">
            {isArrived ? (
              <button className="gmaps-btn-replay" onClick={handleResetRoute}>
                🔁 Replay Trip
              </button>
            ) : (
              <button 
                className="gmaps-btn-pause"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            )}
          </div>
        </div>

        {/* Route Progress Bar */}
        <div className="gmaps-route-progress">
          <div className="gmaps-route-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Service Start OTP Card */}
        <div className="gmaps-otp-banner">
          <div className="gmaps-otp-left">
            <ShieldCheck size={24} className="text-success" />
            <div>
              <span className="gmaps-otp-title">Service Verification OTP</span>
              <p className="gmaps-otp-desc">Share this code with {worker.name.split(' ')[0]} only when work begins:</p>
            </div>
          </div>
          <div className="gmaps-otp-code-box">
            <span>4892</span>
          </div>
        </div>

        {/* Assigned Worker Profile & Contact Card */}
        <Card variant="elevated" className="gmaps-worker-info-card">
          <div className="gmaps-worker-header">
            <div className="gmaps-worker-avatar-wrap">
              <div className="gmaps-worker-avatar">
                {worker.name[0]}
              </div>
              <span className="gmaps-worker-badge-check">✓</span>
            </div>
            
            <div className="gmaps-worker-text">
              <div className="gmaps-worker-name-row">
                <h4>{worker.name}</h4>
                <Badge variant="success" size="sm">Verified Pro</Badge>
              </div>
              <p className="text-xs text-muted">
                ⭐ {worker.rating.toFixed(1)} rating • {worker.cooperative || 'Sahakar City Cooperative'}
              </p>
            </div>
          </div>

          <div className="gmaps-worker-action-row">
            <a href={`tel:${worker.phone || '9876543210'}`} className="gmaps-action-btn call">
              <Phone size={18} />
              <span>Call Worker</span>
            </a>
            <button className="gmaps-action-btn chat" onClick={() => alert(`Connecting with ${worker.name}...`)}>
              <MessageCircle size={18} />
              <span>Message</span>
            </button>
            <button className="gmaps-action-btn share" onClick={() => alert('Live tracking link copied to clipboard!')}>
              <Share2 size={18} />
              <span>Share ETA</span>
            </button>
          </div>
        </Card>

        {/* Customer Service Safety Tip */}
        <div className="gmaps-safety-tip">
          <Sparkles size={16} className="text-primary" />
          <span>All Sahakar Seva workers are police-verified and health-screened by the cooperative.</span>
        </div>
      </div>
    </div>
  );
}


