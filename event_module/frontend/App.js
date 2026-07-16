import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardOverview from './DashboardOverview';
import EventList from './EventList';
import EventEditor from './EventEditor';
import SalesAnalysis from './SalesAnalysis';
import AttendanceControl from './AttendanceControl';
import Login from './Login';
import Register from './Register';
import { AuthProvider, useAuth } from './AuthContext';
import EventDiscovery from './EventDiscovery';
import EventDetailClient from './EventDetailClient';
import MyTickets from './MyTickets';
import ProfileEditor from './ProfileEditor';
import OrganizerProfileEditor from './OrganizerProfileEditor';
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
const App = () => {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/explore", element: _jsx(EventDiscovery, {}) }), _jsx(Route, { path: "/event/:id", element: _jsx(EventDetailClient, {}) }), _jsx(Route, { path: "/my-tickets", element: _jsx(ProtectedRoute, { children: _jsx(MyTickets, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfileEditor, {}) }) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(DashboardLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(DashboardOverview, {}) }), _jsx(Route, { path: "events", element: _jsx(EventList, {}) }), _jsx(Route, { path: "sales", element: _jsx(SalesAnalysis, {}) }), _jsx(Route, { path: "events/new", element: _jsx(EventEditor, {}) }), _jsx(Route, { path: "events/edit/:id", element: _jsx(EventEditor, {}) }), _jsx(Route, { path: "events/:id/attendance", element: _jsx(AttendanceControl, {}) }), _jsx(Route, { path: "profile", element: _jsx(ProfileEditor, {}) }), _jsx(Route, { path: "company-profile", element: _jsx(OrganizerProfileEditor, {}) })] })] }) }) }));
};
export default App;
//# sourceMappingURL=App.js.map