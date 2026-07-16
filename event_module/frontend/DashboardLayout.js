import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, PlusCircle, Building2, Bell, UserCircle, LogOut, BarChart2, Menu, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import './DashboardLayout.css';
const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const getPageTitle = () => {
        if (location.pathname.includes('/events/new'))
            return 'Crear Nuevo Evento';
        if (location.pathname.includes('/events/edit'))
            return 'Editar Evento';
        if (location.pathname.includes('/sales'))
            return 'Análisis de Ventas';
        if (location.pathname.includes('/events'))
            return 'Mis Eventos';
        if (location.pathname.includes('/company-profile'))
            return 'Datos de Empresa';
        if (location.pathname.includes('/profile'))
            return 'Mi Perfil';
        return 'Resumen General';
    };
    return (_jsxs("div", { className: "dashboard-container", children: [isMobileMenuOpen && (_jsx("div", { className: "mobile-overlay", onClick: () => setIsMobileMenuOpen(false) })), _jsxs("aside", { className: `sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`, children: [_jsxs("div", { className: "sidebar-brand", children: [_jsx("div", { className: "brand-logo", children: _jsx(Building2, { size: 24 }) }), _jsx("span", { className: "brand-text", children: "Tiki Enterprise" }), _jsx("button", { className: "mobile-close-btn hide-on-desktop", onClick: () => setIsMobileMenuOpen(false), children: _jsx(X, { size: 24 }) })] }), _jsxs("nav", { className: "sidebar-nav", children: [_jsx("p", { className: "nav-label", children: "PLATAFORMA" }), _jsxs(NavLink, { to: "/dashboard", className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, children: [_jsx(LayoutDashboard, { size: 20 }), _jsx("span", { children: "Dashboard" })] }), _jsxs(NavLink, { to: "/events", className: ({ isActive }) => `nav-item ${isActive && !location.pathname.includes('new') ? 'active' : ''}`, children: [_jsx(CalendarDays, { size: 20 }), _jsx("span", { children: "Mis Eventos" })] }), _jsxs(NavLink, { to: "/sales", className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, children: [_jsx(BarChart2, { size: 20 }), _jsx("span", { children: "Ventas" })] }), _jsxs(NavLink, { to: "/events/new", className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, children: [_jsx(PlusCircle, { size: 20 }), _jsx("span", { children: "Crear Evento" })] }), _jsx("p", { className: "nav-label", style: { marginTop: '20px' }, children: "CONFIGURACI\u00D3N" }), user?.role === 'customer' && (_jsxs(NavLink, { to: "/profile", className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, children: [_jsx(UserCircle, { size: 20 }), _jsx("span", { children: "Mi Perfil" })] })), user?.role === 'organizer' && (_jsxs(NavLink, { to: "/company-profile", className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, children: [_jsx(Building2, { size: 20 }), _jsx("span", { children: "Datos de Empresa" })] }))] }), _jsx("div", { className: "sidebar-footer", children: _jsxs("div", { className: "user-profile", children: [_jsx(UserCircle, { size: 32, color: "#64748B" }), _jsxs("div", { className: "user-info", children: [_jsx("span", { className: "user-name", children: user?.name || 'Usuario' }), _jsx("span", { className: "user-role", children: user?.role === 'organizer' ? 'Organizador' : 'Cliente' })] }), _jsx("button", { onClick: () => { logout(); navigate('/login'); }, style: { background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: '#64748B' }, children: _jsx(LogOut, { size: 20 }) })] }) })] }), _jsxs("main", { className: "main-content", children: [_jsxs("header", { className: "top-header", children: [_jsxs("div", { className: "header-title", style: { display: 'flex', alignItems: 'center', gap: '15px' }, children: [_jsx("button", { className: "icon-btn hide-on-desktop", onClick: () => setIsMobileMenuOpen(true), children: _jsx(Menu, { size: 24 }) }), _jsx("h1", { children: getPageTitle() })] }), _jsx("div", { className: "header-actions", children: _jsxs("button", { className: "icon-btn", children: [_jsx(Bell, { size: 20 }), _jsx("span", { className: "notification-dot" })] }) })] }), _jsx("div", { className: "content-area", children: _jsx(Outlet, {}) })] })] }));
};
export default DashboardLayout;
//# sourceMappingURL=DashboardLayout.js.map