import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import DayViewPage from './pages/DayViewPage';
import SchedulePage from './pages/SchedulePage'; // >>> 1. ייבוא הדף החדש
import NewAppointmentPage from './pages/NewAppointmentPage';
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';

// רכיב "שומר סף" שבודק אם המשתמש מחובר
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  // אם עדיין בודקים אם המשתמש מחובר, נציג הודעת טעינה
  if (isLoading) {
    return <div>טוען...</div>;
  }
  
  // אם יש משתמש, נציג את הדף. אם לא, נעביר לדף ההתחברות.
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container">
          <Routes>
            {/* נתיבים ציבוריים שכל אחד יכול לגשת אליהם */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* נתיבים מוגנים שדורשים התחברות */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            {/* >>> 2. רישום הנתיב החדש של לוח השנה <<< */}
            <Route path="/schedule" element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            } />
            
            <Route path="/day/:date" element={
              <ProtectedRoute>
                <DayViewPage />
              </ProtectedRoute>
            } />
            
            <Route path="/new-appointment" element={
              <ProtectedRoute>
                <NewAppointmentPage />
              </ProtectedRoute>
            } />

            {/* נתיב ברירת מחדל אם שום דבר לא תאם */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;