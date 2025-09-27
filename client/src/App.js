import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage'; 
import HistoryPage from './pages/HistoryPage';
import TrainerHistoryPage from './pages/TrainerHistoryPage';
import DashboardPage from './pages/DashboardPage';
import ManageSchedulePage from './pages/ManageSchedulePage'; 
import BookingConfirmedPage from './pages/BookingConfirmedPage';
import BookingErrorPage from './pages/BookingErrorPage';
import Breadcrumbs from './components/Breadcrumbs';

import './App.css';
import 'react-datepicker/dist/react-datepicker.css';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, activeRole, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">טוען...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return allowedRoles.includes(activeRole) 
        ? <Outlet /> 
        : <Navigate to="/unauthorized" replace />;
};


function AppRoutes() {
  return (
    <main className="main-content">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking-confirmed" element={<BookingConfirmedPage status="confirmed" />} />
        <Route path="/booking-declined" element={<BookingConfirmedPage status="declined" />} />
        <Route path="/booking-error" element={<BookingErrorPage />} />

        <Route element={<ProtectedRoute allowedRoles={['admin', 'trainer', 'member']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/trainer-history" element={<TrainerHistoryPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/manage/schedule" element={<ManageSchedulePage />} />
        </Route>
        
        <Route path="/unauthorized" element={
            <div style={{textAlign: 'center', marginTop: '50px'}}>
                <h1>403 - אין הרשאה</h1>
                <p>אין לך הרשאה לגשת לדף המבוקש.</p>
            </div>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Breadcrumbs />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;