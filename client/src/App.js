import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// 1. ייבוא כל הדפים הרלוונטיים
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage'; // הלו"ז הרגיל למתאמנים/מאמנים
import HistoryPage from './pages/HistoryPage';
import TrainerHistoryPage from './pages/TrainerHistoryPage';

// <<< ייבוא הרכיבים החדשים למערכת הניהול >>>
import DashboardPage from './pages/DashboardPage'; // זהו רכיב ה-"Switcher" החכם
import ManageSchedulePage from './pages/ManageSchedulePage'; // דף ניהול הלו"ז למנהל

// (נוסיף את הדפים הבאים בהמשך)
// import StudioSettingsPage from './pages/StudioSettingsPage'; 
// import TrainerManagementPage from './pages/TrainerManagementPage';

import './App.css';
import 'react-datepicker/dist/react-datepicker.css';


// 2. שדרוג רכיב ה-ProtectedRoute כך שיבדוק גם תפקידים
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, activeRole, isLoading } = useAuth();

    // בזמן שה-Context טוען את פרטי המשתמש, נציג הודעת טעינה
    if (isLoading) {
        return <div className="loading">טוען...</div>;
    }

    // אם אין משתמש מחובר כלל, נעביר לדף ההתחברות
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // אם יש משתמש, נבדוק אם התפקיד הפעיל שלו מורשה לגשת לנתיב
    // Outlet הוא רכיב מיוחד שמציג את הדף הרצוי אם התנאים מתקיימים
    return allowedRoles.includes(activeRole) 
        ? <Outlet /> 
        : <Navigate to="/unauthorized" replace />;
};


function AppRoutes() {
  return (
    <main className="container">
      <Routes>
        {/* --- נתיבים ציבוריים --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- נתיבים שדורשים התחברות (כל התפקידים מורשים) --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'trainer', 'member']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/trainer-history" element={<TrainerHistoryPage />} />
        </Route>

        {/* --- נתיבים שדורשים הרשאת מנהל בלבד --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/manage/schedule" element={<ManageSchedulePage />} />
            {/* <Route path="/manage/studio" element={<StudioSettingsPage />} /> */}
            {/* <Route path="/manage/trainers" element={<TrainerManagementPage />} /> */}
        </Route>
        
        {/* --- דפי שגיאה וגיבוי --- */}
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
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;