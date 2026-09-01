import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockServices, currentWeather } from '../../data/mockServices';
import { addBooking } from '../../data/mockBookings';
import { useAuth } from '../../context/AuthContext';
import { 
  Upload, 
  MapPin, 
  Calendar, 
  Clock, 
  CloudRain, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  Video, 
  Receipt, 
  Sparkles, 
  X, 
  Image as ImageIcon,
  Printer,
  Navigation,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input, { TextArea } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { FairnessBadge } from '../../components/ui/Badge';
import SpeechToText from '../../components/SpeechToText';
import VideoCallModal from '../../components/VideoCallModal';
import BillReceiptModal from '../../components/BillReceiptModal';
import { getServiceDiagnosis } from '../../services/geminiService';
import './BookingPage.css';

const QUICK_TAGS = {
  plumbing: ['💧 Pipe Leakage', '🚿 Tap / Faucet Repair', '🚽 Drain Blockage', '🔧 General Plumbing Check'],
  electrical: ['⚡ Switch / Socket Issue', '💡 Light / Fan Installation', '🔌 MCB Tripping', '🔧 Full Home Inspection'],
  'ac-repair': ['❄️ No / Low Cooling', '🔊 Strange Noise / Vibration', '💧 Water Leaking from AC', '🧹 Filter Cleaning & Gas'],
  cleaning: ['🧹 Full Home Deep Cleaning', '🍳 Kitchen Deep Cleaning', '🚿 Bathroom Cleaning', '🛋️ Sofa / Carpet Shampoo'],
  carpentry: ['🚪 Door Lock / Hinge Repair', '🪑 Furniture Assembly', '🪵 Custom Woodwork', '🔧 General Carpentry'],
  painting: ['🎨 Single Room Painting', '🏠 Full House Repaint', '🖌️ Wall Texture / Touch-up', '💧 Waterproofing Treatment'],
  'pest-control': ['🪳 Cockroach Control', '🐜 Termite Treatment', '🦟 Mosquito Fogging', '🐀 Rodent Control'],
  appliance: ['🧺 Washing Machine Repair', '🧊 Refrigerator Servicing', '🍲 Microwave Repair', '💧 RO Purifier Service']
};

// Billing Calculator
function calcBilling(basePrice, weatherMultiplier, isRuralOrDistant = false) {
  const adjusted = Math.round(basePrice * weatherMultiplier);
  const gst = Math.round(adjusted * 0.18);
  const welfareCess = Math.round(adjusted * 0.02);
  const distanceSurcharge = isRuralOrDistant ? Math.round(adjusted * 0.15) : 0;
  const total = adjusted + gst + welfareCess + distanceSurcharge;
  return { base: adjusted, gst, welfareCess, distanceSurcharge, total };
}

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('service');
  const preselectedDesc = searchParams.get('desc');
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [step, setStep] = useState(preselected ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselected || 'plumbing');
  const [description, setDescription] = useState(preselectedDesc ? `${preselectedDesc} (Scheduled Maintenance)` : '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [address, setAddress] = useState(profile?.address || '12, Sector 45, Gurugram, Haryana');
  const [photos, setPhotos] = useState([]);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const fileInputRef = useRef(null);

  // Sync if query param changes
  useEffect(() => {
    if (preselected) {
      setSelectedService(preselected);
      setStep(2);
      if (preselectedDesc) {
        setDescription(`${preselectedDesc} (Scheduled Maintenance)`);
      }
    }
  }, [preselected, preselectedDesc]);

  const service = mockServices.find(s => s.id === selectedService) || mockServices[0];
  const weatherMultiplier = service ? (currentWeather.multiplier * (service.weatherMultiplier || 1)) : 1;
  const billing = service ? calcBilling(service.basePrice, weatherMultiplier) : null;

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const readers = files.map(f => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result, name: f.name });
      reader.readAsDataURL(f);
    }));
    Promise.all(readers).then(results => setPhotos(prev => [...prev, ...results].slice(0, 4)));
  };

  const runAiDiagnosis = async () => {
    if (!description && photos.length === 0) return;
    setDiagnosing(true);
    const imageBase64 = photos[0]?.url?.split(',')[1] || null;
    const { text } = await getServiceDiagnosis(description || `${service.name} issue`, 'English', imageBase64);
    setAiDiagnosis(text);
    setDiagnosing(false);
  };

  const handleConfirm = () => {
    // Save to persistent bookings
    const newBooking = addBooking({
      customerId: user?.id || 'c1',
      customerName: profile?.full_name || user?.name || 'Rahul Sharma',
      workerId: 'w1',
      workerName: 'Suresh Kumar',
      workerRating: 4.8,
      workerPhone: '+91 76543 21098',
      serviceId: service.id,
      serviceName: service.name,
      description: description.trim() || `${service.name} Standard Inspection & Service`,
      address: address,
      date: date,
      time: time,
      status: 'en-route',
      basePrice: service.basePrice,
      weatherMultiplier: weatherMultiplier,
      weatherCondition: currentWeather.isActive ? currentWeather.label : 'Clear',
      totalPrice: billing?.total || service.basePrice,
      gst: billing?.gst,
      welfareCess: billing?.welfareCess,
      photos: photos
    });

    setConfirmedBooking(newBooking);
  };

  if (confirmedBooking) {
    return (
      <div className="booking-confirmed-card animate-scale-in">
        <div className="confirmed-icon">
          <CheckCircle2 size={52} color="white" />
        </div>
        <h2>Booking Confirmed! 🎉</h2>
        <p className="confirmed-subtitle">
          Your <strong>{confirmedBooking.serviceName}</strong> service has been scheduled.
        </p>

        <div className="confirmed-meta-box">
          <div className="meta-row">
            <span>Booking ID:</span>
            <strong className="font-mono">#{confirmedBooking.id}</strong>
          </div>
          <div className="meta-row">
            <span>Assigned Professional:</span>
            <strong>{confirmedBooking.workerName} (⭐ {confirmedBooking.workerRating})</strong>
          </div>
          <div className="meta-row">
            <span>Service Slot:</span>
            <strong>{confirmedBooking.date} at {confirmedBooking.time}</strong>
          </div>
          <div className="meta-row">
            <span>Total Amount Paid:</span>
            <strong className="text-primary">₹{confirmedBooking.totalPrice} (GST Included)</strong>
          </div>
        </div>

        {/* Start OTP */}
        <div className="confirmed-otp-card">
          <ShieldCheck size={22} className="text-success" />
          <div>
            <span>Start-Service Verification OTP: </span>
            <strong className="confirmed-otp-code">4892</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="confirmed-action-buttons">
          <Button 
            variant="primary" 
            size="lg" 
            icon={Navigation}
            onClick={() => navigate(`/customer/track/${confirmedBooking.id}`)}
          >
            🗺️ Track Worker Live
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            icon={Printer}
            onClick={() => setShowReceipt(true)}
          >
            🖨️ Print Bill Receipt
          </Button>

          <Button 
            variant="ghost" 
            size="md"
            onClick={() => navigate('/customer/bookings')}
          >
            📋 View My Bookings
          </Button>
        </div>

        {/* Printable Bill Receipt Modal */}
        <BillReceiptModal 
          isOpen={showReceipt} 
          onClose={() => setShowReceipt(false)} 
          booking={confirmedBooking} 
        />
      </div>
    );
  }

  const currentTags = QUICK_TAGS[selectedService] || QUICK_TAGS.plumbing;

  return (
    <div className="booking-page">
      {/* Step Indicator */}
      <div className="booking-steps">
        {['1. Choose Service', '2. Describe Issue', '3. Schedule', '4. Review & Confirm'].map((s, i) => (
          <div key={i} className={`booking-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
            <div className="step-circle">{step > i + 1 ? <Check size={14} /> : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* STEP 1 — Choose Service */}
      {step === 1 && (
        <div className="booking-section animate-fade-in-up">
          <h2>What service do you need?</h2>
          <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>Select a verified cooperative service category</p>
          <div className="services-grid">
            {mockServices.map(s => (
              <Card
                key={s.id}
                className={`service-select-card ${selectedService === s.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedService(s.id);
                  setStep(2);
                }}
              >
                <span className="service-select-icon" style={{ background: s.color + '15', color: s.color }}>{s.icon}</span>
                <h4>{s.name}</h4>
                <p className="text-xs text-muted">From ₹{s.basePrice}</p>
              </Card>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Button variant="primary" icon={ArrowRight} iconPosition="right" onClick={() => setStep(2)}>
              Next: Describe Issue →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Describe Issue */}
      {step === 2 && (
        <div className="booking-section animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2.2rem' }}>{service?.icon}</span>
            <div>
              <h2 style={{ margin: '0 0 2px' }}>{service?.name}</h2>
              <p className="text-muted text-sm">Tell us about the issue or pick a quick tag below</p>
            </div>
          </div>

          {/* Quick Problem Chips */}
          <div className="booking-quick-chips">
            <span className="quick-chip-label">Quick Select:</span>
            {currentTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip-btn"
                onClick={() => setDescription(prev => prev ? `${prev}, ${tag}` : tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Description with Voice */}
          <div className="booking-describe-row">
            <div style={{ flex: 1 }}>
              <label className="form-label">Describe your issue (Optional / Details)</label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Kitchen sink is leaking, water dripping below the pipe..."
                rows={3}
              />
            </div>
          </div>

          {/* Multilingual Speech to Text (Hindi, English, Bengali) */}
          <div style={{ marginTop: '8px' }}>
            <SpeechToText onTranscript={(text) => setDescription(prev => (prev ? prev + ' ' : '') + text)} />
          </div>

          {/* Photo Upload */}
          <div className="booking-photo-section">
            <div className="booking-photo-header">
              <h4>📸 Add Photos of the Problem (Optional)</h4>
              <p className="text-xs text-muted">Up to 4 photos help our cooperative technicians bring exact spare parts</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
            <div className="booking-photos-row">
              {photos.map((p, i) => (
                <div key={i} className="booking-photo-preview">
                  <img src={p.url} alt={p.name} />
                  <button className="photo-remove-btn" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <button type="button" className="booking-photo-add" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={24} />
                  <span>Add Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Diagnosis */}
          <div className="booking-ai-section">
            <Button variant="outline" icon={Sparkles} loading={diagnosing} onClick={runAiDiagnosis}>
              AI Smart Diagnosis (Gemini)
            </Button>
            {aiDiagnosis && (
              <Card variant="subtle" className="ai-diagnosis-result animate-fade-in-up">
                <div className="ai-diagnosis-header">
                  <Sparkles size={16} />
                  <strong>AI Recommended Solution:</strong>
                </div>
                <p className="text-sm" style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{aiDiagnosis}</p>
              </Card>
            )}
          </div>

          <div className="booking-nav">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" icon={ArrowRight} iconPosition="right" onClick={() => setStep(3)}>
              Next: Pick Slot →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Schedule */}
      {step === 3 && (
        <div className="booking-section animate-fade-in-up">
          <h2>Schedule Your Service</h2>
          <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>Pick your convenient date and preferred time slot</p>

          {currentWeather.isActive && (
            <div className="weather-warning">
              <CloudRain size={18} />
              <div>
                <strong>{currentWeather.label} Surge & Delay Protection</strong>
                <p>Transparent weather adjustment: {Math.round((currentWeather.multiplier - 1) * 100)}% goes directly to the technician as bad-weather compensation.</p>
              </div>
            </div>
          )}

          {/* Quick Time Slots */}
          <div className="time-slot-chips">
            <span className="slot-chip-label">Quick Slot:</span>
            {[
              { label: '⏰ ASAP (Within 45 mins)', val: 'ASAP' },
              { label: '🌅 10:00 AM', val: '10:00 AM' },
              { label: '☀️ 02:00 PM', val: '02:00 PM' },
              { label: '🌇 05:00 PM', val: '05:00 PM' }
            ].map((slot, idx) => (
              <button
                key={idx}
                type="button"
                className={`time-chip-btn ${time === slot.val ? 'selected' : ''}`}
                onClick={() => setTime(slot.val)}
              >
                {slot.label}
              </button>
            ))}
          </div>

          <div className="schedule-grid">
            <div>
              <label className="form-label"><Calendar size={14} /> Service Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="form-label"><Clock size={14} /> Custom Time</label>
              <Input type="time" value={time.includes(':') && !time.includes('M') ? time : '10:00'} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="form-label"><MapPin size={14} /> Service Address</label>
            <TextArea value={address} onChange={e => setAddress(e.target.value)} rows={2} />
          </div>

          <div className="booking-nav">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" icon={ArrowRight} iconPosition="right" onClick={() => setStep(4)}>
              Review & Pay →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — Confirm & Pay */}
      {step === 4 && billing && (
        <div className="booking-section animate-fade-in-up">
          <h2>Review & Confirm Booking</h2>
          <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>Fair price guarantee with cooperative backing</p>

          {/* GST Billing Breakdown */}
          <Card variant="elevated" className="billing-card">
            <div className="billing-header">
              <Receipt size={20} />
              <h3>GST-Compliant Invoice Preview</h3>
            </div>
            <div className="billing-service">
              <span style={{ fontSize: '1.8rem' }}>{service.icon}</span>
              <div>
                <strong>{service.name}</strong>
                <p className="text-xs text-muted">{date} • {time} • {address.split(',')[0]}</p>
              </div>
            </div>
            <div className="billing-breakdown">
              <div className="billing-row"><span>Base Service Charge</span><span>₹{billing.base}</span></div>
              {currentWeather.isActive && <div className="billing-row weather"><span>Weather Allowance ({Math.round((currentWeather.multiplier - 1) * 100)}%)</span><span>Included</span></div>}
              {billing.distanceSurcharge > 0 && <div className="billing-row"><span>Distance Surcharge</span><span>₹{billing.distanceSurcharge}</span></div>}
              <div className="billing-row"><span>GST @ 18% (CGST 9% + SGST 9%)</span><span>₹{billing.gst}</span></div>
              <div className="billing-row"><span>Cooperative Welfare Cess @ 2%</span><span>₹{billing.welfareCess}</span></div>
              <div className="billing-divider" />
              <div className="billing-row total"><span>Total Payable</span><span className="text-primary font-bold">₹{billing.total}</span></div>
            </div>
            <p className="billing-note">💡 Official Tax Invoice receipt will be generated immediately upon confirmation.</p>
          </Card>

          {/* Photos summary */}
          {photos.length > 0 && (
            <div className="confirm-photos">
              <p className="text-sm text-muted">📸 {photos.length} photo(s) attached for technician</p>
              <div className="confirm-photos-row">
                {photos.map((p, i) => <img key={i} src={p.url} alt="" className="confirm-photo-thumb" />)}
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <FairnessBadge position={1} />
          </div>

          <div className="booking-nav">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(3)}>Back</Button>
            <Button variant="primary" size="lg" onClick={handleConfirm}>
              ✅ Confirm Booking — ₹{billing.total}
            </Button>
          </div>
        </div>
      )}

      <VideoCallModal isOpen={showVideoCall} onClose={() => setShowVideoCall(false)} workerName="Suresh Kumar" workerRating={4.8} />
    </div>
  );
}

