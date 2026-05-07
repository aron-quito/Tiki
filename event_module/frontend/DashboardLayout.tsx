import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PlusCircle, Building2, Bell, UserCircle } from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/events/new')) return 'Crear Nuevo Evento';
    if (location.pathname.includes('/events/edit')) return 'Editar Evento';
    if (location.pathname.includes('/events')) return 'Mis Eventos';
    return 'Resumen General';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Building2 size={24} />
          </div>
          <span className="brand-text">Tiki Enterprise</span>
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
          
          <NavLink to="/events/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            <span>Crear Evento</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <UserCircle size={32} color="#64748B" />
            <div className="user-info">
              <span className="user-name">Productora XYZ</span>
              <span className="user-role">Plan Premium</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
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
