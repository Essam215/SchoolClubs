import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CalendarEvents from './pages/CalendarEvents';
import EventTimeline from './pages/EventTimeline';
import Chat from './pages/Chat';
import RoomScheduling from './pages/RoomScheduling';
import Tasks from './pages/Tasks';
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import Gamification from './pages/Gamification';
import AdminDashboard from './pages/AdminDashboard';
import SuggestionBox from './pages/SuggestionBox';
import AttendanceTracking from './pages/AttendanceTracking';
import ResourceLibrary from './pages/ResourceLibrary';
import PhotoAlbum from './pages/PhotoAlbum';
import Admissions from './pages/Admissions';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="events" element={<CalendarEvents />} />
            <Route path="timeline" element={<EventTimeline />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="gamification" element={<Gamification />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="suggestions" element={<SuggestionBox />} />
            <Route path="attendance" element={<AttendanceTracking />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="gallery" element={<PhotoAlbum />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="chat" element={<Chat />} />
            <Route path="rooms" element={<RoomScheduling />} />
            <Route path="register" element={<Registration />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
