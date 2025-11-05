import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ייבוא כל הרכיבים והדפים שלך
import ProtectedRoute from './components/ProtectedRoute'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage'; 
import MemberHistoryPage from './pages/MemberHistoryPage';
import TrainerHistoryPage from './pages/TrainerHistoryPage';
import ManageSchedulePage from './pages/ManageSchedulePage'; 
import BookingConfirmedPage from './pages/BookingConfirmedPage';
import BookingErrorPage from './pages/BookingErrorPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

import './App.css';
import 'react-datepicker/dist/react-datepicker.css';

// --- ⬇️ זה הרכיב החדש והחשוב ⬇️ ---
// רכיב זה עוטף את כל הראוטים ובודק אם המערכת עדיין טוענת את פרטי המשתמש
const AppRoutes = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">טוען...</div>; // מציג מסך טעינה גלובלי
    }

    // רק אחרי שהטעינה הסתיימה, הוא מציג את הראוטים
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/booking-confirmed" element={<BookingConfirmedPage status="confirmed" />} />
            <Route path="/booking-declined" element={<BookingConfirmedPage status="declined" />} />
            <Route path="/booking-error" element={<BookingErrorPage />} />

            <Route element={<MainLayout />}>
                <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                    <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['admin', 'trainer', 'member']} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/history" element={<MemberHistoryPage />} />
                    <Route path="/trainer-history" element={<TrainerHistoryPage />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/manage/schedule" element={<ManageSchedulePage />} />
                </Route>
            </Route>

            <Route path="/unauthorized" element={
                <div style={{textAlign: 'center', marginTop: '50px'}}>
                    <h1>403 - אין הרשאה</h1>
                    <p>אין לך הרשאה לגשת לדף המבוקש.</p>
                </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} /> 
        </Routes>
    );
};

// רכיב הפריסה (Layout) שמכיל את החלקים המשותפים
const MainLayout = () => {
    return (
        <div className="layout-wrapper"> 
            <Navbar />
            <Breadcrumbs />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes /> {/* קוראים לרכיב החדש שעוטף את כל הלוגיקה */}
      </AuthProvider>
    </Router>
  );
}

export default App;