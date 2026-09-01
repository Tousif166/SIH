import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, AlertTriangle, TrendingUp, LogOut, Bell, Menu, X, Shield } from 'lucide-react';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { useState } from 'react';
import '../customer/CustomerLayout.css';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, translationKey: 'dashboard', end: true },
  { path: '/admin/workers', icon: Users, translationKey: 'workers' },
  { path: '/admin/complaints', icon: AlertTriangle, translationKey: 'complaints' },
  { path: '/admin/forecast', icon: TrendingUp, translationKey: 'forecast' }
];

export default function AdminLayout() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth', { replace: true }); };

  return (
    <div className="app-layout">
      <aside className="sidebar hide-mobile">
        <div className="sidebar-brand">
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
            <Shield size={18} />
          </div>
          <span className="sidebar-brand-text">Sahakar Admin</span>
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
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>A</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{profile?.full_name || user?.name || 'Admin'}</span>
              <span className="sidebar-user-role">{t('admin')}</span>
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
