import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout.js';
import DashboardOverview from './DashboardOverview.js';
import EventList from './EventList.js';
import EventEditor from './EventEditor.js';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/new" element={<EventEditor />} />
          <Route path="events/edit/:id" element={<EventEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
