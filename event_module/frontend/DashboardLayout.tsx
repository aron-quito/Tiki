import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PlusCircle, Building2, Bell, UserCircle, LogOut, BarChart2, Menu, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import './DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.includes('/events/new')) return 'Crear Nuevo Evento';
    if (location.pathname.includes('/events/edit')) return 'Editar Evento';
    if (location.pathname.includes('/sales')) return 'Análisis de Ventas';
    if (location.pathname.includes('/events')) return 'Mis Eventos';
    if (location.pathname.includes('/company-profile')) return 'Datos de Empresa';
    if (location.pathname.includes('/profile')) return 'Mi Perfil';
    return 'Resumen General';
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Building2 size={24} />
          </div>
          <span className="brand-text">Tiki Enterprise</span>
          <button className="mobile-close-btn hide-on-desktop" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <p className="nav-label">PLATAFORMA</p>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive && !location.pathname.includes('new') ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <span>Mis Eventos</span>
          </NavLink>
          
          <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart2 size={20} />
            <span>Ventas</span>
          </NavLink>
          
          <NavLink to="/events/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            <span>Crear Evento</span>
          </NavLink>

          <p className="nav-label" style={{ marginTop: '20px' }}>CONFIGURACIÓN</p>
          {user?.role === 'customer' && (
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCircle size={20} />
              <span>Mi Perfil</span>
            </NavLink>
          )}
          {user?.role === 'organizer' && (
            <NavLink to="/company-profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Building2 size={20} />
              <span>Datos de Empresa</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <UserCircle size={32} color="#64748B" />
            <div className="user-info">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-role">{user?.role === 'organizer' ? 'Organizador' : 'Cliente'}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: '#64748B' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="icon-btn hide-on-desktop" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
          </div>
        </header>
        
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
