import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Briefcase, User, CalendarOff, LogOut, Bell, Menu, X, BookOpen } from 'lucide-react';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { useState } from 'react';
import '../customer/CustomerLayout.css';

const navItems = [
  { path: '/worker', icon: Home, translationKey: 'dashboard', end: true },
  { path: '/worker/jobs', icon: Briefcase, translationKey: 'jobs' },
  { path: '/worker/profile', icon: User, translationKey: 'profile' },
  { path: '/worker/leave', icon: CalendarOff, translationKey: 'leave' },
  { path: '/worker/training', icon: BookOpen, translationKey: 'training' },
];

export default function WorkerLayout() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth', { replace: true }); };

  return (
    <div className="app-layout">
      <aside className="sidebar hide-mobile">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Sahakar Seva Logo" className="sidebar-logo-img" />
          <span className="sidebar-brand-text">Sahakar Seva</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <item.icon size={20} /><span>{t(item.translationKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{user?.name?.[0]}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-role">{t('worker')}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}><LogOut size={18} /></button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <button className="mobile-menu-btn hide-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="header-right">
            <LanguageSwitcher />
            <button className="header-icon-btn"><Bell size={20} /><span className="notification-dot" /></button>
          </div>
        </header>
        {mobileMenuOpen && (
          <div className="mobile-menu hide-desktop">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.end}
                className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}>
                <item.icon size={20} /><span>{t(item.translationKey)}</span>
              </NavLink>
            ))}
            <button className="mobile-menu-link logout" onClick={handleLogout}><LogOut size={20} /><span>{t('logout')}</span></button>
          </div>
        )}
        <main className="main-content"><Outlet /></main>
      </div>

      <nav className="bottom-tabs hide-desktop">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
            <item.icon size={20} /><span>{t(item.translationKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
