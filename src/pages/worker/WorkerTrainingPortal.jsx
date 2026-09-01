import { useState } from 'react';
import { BookOpen, Play, CheckCircle, Clock, MapPin, Award, ChevronRight, Video, FileText, Wifi, WifiOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './WorkerTrainingPortal.css';

const COURSES = [
  { id: 1, title: 'Plumbing Fundamentals', titleHi: 'प्लम्बिंग बुनियादी', duration: '40 hrs', level: 'Beginner', type: 'offline', center: 'Delhi Seva Kendra, Rohini', enrolled: true, progress: 65, modules: 12, completed: 8, cert: false, icon: '🔧', color: '#3b82f6' },
  { id: 2, title: 'Electrical Safety & Wiring', titleHi: 'विद्युत सुरक्षा', duration: '50 hrs', level: 'Beginner', type: 'hybrid', center: 'Gurugram ITI Campus', enrolled: false, progress: 0, modules: 15, completed: 0, cert: false, icon: '⚡', color: '#f59e0b' },
  { id: 3, title: 'AC Repair & Refrigeration', titleHi: 'एसी मरम्मत', duration: '60 hrs', level: 'Intermediate', type: 'offline', center: 'NSDC Partner Center, Noida', enrolled: false, progress: 0, modules: 18, completed: 0, cert: false, icon: '❄️', color: '#06b6d4' },
  { id: 4, title: 'Home Cleaning & Hygiene', titleHi: 'सफाई प्रशिक्षण', duration: '20 hrs', level: 'Beginner', type: 'online', center: 'Online Only', enrolled: true, progress: 100, modules: 8, completed: 8, cert: true, icon: '🧹', color: '#10b981' },
  { id: 5, title: 'Carpentry & Woodwork Basics', titleHi: 'बढ़ईगिरी', duration: '45 hrs', level: 'Beginner', type: 'offline', center: 'Jaipur Skill Hub', enrolled: false, progress: 0, modules: 14, completed: 0, cert: false, icon: '🔨', color: '#ef4444' },
];

const SEVA_KENDRAS = [
  { city: 'Delhi', address: 'Rohini Sector 15, Delhi - 110085', phone: '011-XXXX-XXXX', open: 'Mon–Sat 9AM–6PM' },
  { city: 'Gurugram', address: 'DLF Phase 2, Gurugram - 122002', phone: '0124-XXXX-XXXX', open: 'Mon–Sat 9AM–6PM' },
  { city: 'Noida', address: 'Sector 18, Noida - 201301', phone: '0120-XXXX-XXXX', open: 'Mon–Sat 9AM–6PM' },
  { city: 'Jaipur', address: 'Malviya Nagar, Jaipur - 302017', phone: '0141-XXXX-XXXX', open: 'Mon–Sat 9AM–5PM' },
];

const TYPE_LABELS = { offline: '🏢 Offline', hybrid: '🔀 Hybrid', online: '💻 Online' };
const LEVEL_VARIANTS = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' };

export default function WorkerTrainingPortal() {
  const [filter, setFilter] = useState('all');
  const [enrolling, setEnrolling] = useState(null);
  const [courses, setCourses] = useState(COURSES);

  const handleEnroll = (id) => {
    setEnrolling(id);
    setTimeout(() => {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, enrolled: true } : c));
      setEnrolling(null);
    }, 1500);
  };

  const filtered = filter === 'all' ? courses : filter === 'enrolled' ? courses.filter(c => c.enrolled) : courses.filter(c => c.type === filter);

  return (
    <div className="training-page">
      <div className="training-header">
        <div>
          <h1>🎓 Offline Training Portal</h1>
          <p className="text-muted">कौशल विकास प्रशिक्षण • Skill Development for Freshers & Upgrades</p>
        </div>
        <div className="training-internship-badge">
          <Award size={16} />
          Internship Program • Government-Certified
        </div>
      </div>

      {/* Stats */}
      <div className="training-stats">
        <div className="training-stat">
          <span className="training-stat-val">{courses.filter(c => c.enrolled).length}</span>
          <span>Enrolled Courses</span>
        </div>
        <div className="training-stat">
          <span className="training-stat-val">{courses.filter(c => c.cert).length}</span>
          <span>Certificates Earned</span>
        </div>
        <div className="training-stat">
          <span className="training-stat-val">
            {Math.round(courses.filter(c => c.enrolled).reduce((a, c) => a + c.progress, 0) / Math.max(courses.filter(c => c.enrolled).length, 1))}%
          </span>
          <span>Avg. Progress</span>
        </div>
      </div>

      {/* Filters */}
      <div className="training-filters">
        {['all', 'enrolled', 'offline', 'online', 'hybrid'].map(f => (
          <button key={f} className={`training-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Courses' : f === 'enrolled' ? 'My Courses' : TYPE_LABELS[f] || f}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className="training-grid">
        {filtered.map(course => (
          <Card key={course.id} variant="elevated" className={`training-card animate-fade-in-up ${course.enrolled ? 'enrolled' : ''}`}>
            <div className="training-card-header">
              <div className="training-icon" style={{ background: course.color + '15', color: course.color }}>
                <span style={{ fontSize: '1.4rem' }}>{course.icon}</span>
              </div>
              <div className="training-card-badges">
                <Badge variant={LEVEL_VARIANTS[course.level]} size="sm">{course.level}</Badge>
                <Badge variant="ghost" size="sm">{TYPE_LABELS[course.type]}</Badge>
              </div>
            </div>

            <h3 className="training-card-title">{course.title}</h3>
            <p className="training-card-hindi text-muted">{course.titleHi}</p>

            <div className="training-meta">
              <span><Clock size={13} /> {course.duration}</span>
              <span><BookOpen size={13} /> {course.modules} Modules</span>
              {course.type !== 'online' && <span><MapPin size={13} /> {course.center}</span>}
            </div>

            {course.enrolled && (
              <div className="training-progress-wrap">
                <div className="training-progress-bar">
                  <div className="training-progress-fill" style={{ width: `${course.progress}%`, background: course.color }} />
                </div>
                <span>{course.progress}% • {course.completed}/{course.modules} modules</span>
              </div>
            )}

            {course.cert && (
              <div className="training-cert-earned">
                <CheckCircle size={14} />
                Certificate Earned! Download →
              </div>
            )}

            <div className="training-card-actions">
              {course.enrolled ? (
                <Button variant="primary" icon={Play} size="sm" style={{ background: course.color, borderColor: course.color }}>
                  {course.progress === 100 ? 'Review Course' : 'Continue →'}
                </Button>
              ) : (
                <Button
                  variant="primary" size="sm"
                  loading={enrolling === course.id}
                  onClick={() => handleEnroll(course.id)}
                >
                  Enroll Free
                </Button>
              )}
              <Button variant="ghost" size="sm" icon={FileText}>Syllabus</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Seva Kendra Locations */}
      <div className="training-kendras">
        <h2>🏢 Nearest Offline Seva Kendras</h2>
        <p className="text-muted">Visit any center for in-person registration & training support</p>
        <div className="kendra-grid">
          {SEVA_KENDRAS.map(k => (
            <div key={k.city} className="kendra-card">
              <div className="kendra-city">{k.city}</div>
              <div className="kendra-address"><MapPin size={13} /> {k.address}</div>
              <div className="kendra-phone">📞 {k.phone}</div>
              <div className="kendra-hours"><Clock size={13} /> {k.open}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
