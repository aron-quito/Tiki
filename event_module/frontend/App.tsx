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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Client Routes */}
          <Route path="/explore" element={<EventDiscovery />} />
          <Route path="/event/:id" element={<EventDetailClient />} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileEditor /></ProtectedRoute>} />

          {/* Organizer Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="events" element={<EventList />} />
            <Route path="sales" element={<SalesAnalysis />} />
            <Route path="events/new" element={<EventEditor />} />
            <Route path="events/edit/:id" element={<EventEditor />} />
            <Route path="events/:id/attendance" element={<AttendanceControl />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="company-profile" element={<OrganizerProfileEditor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
