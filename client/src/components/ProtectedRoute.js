import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    // --- ⬇️ שלפנו גם את הדגל החדש ⬇️ ---
    const { user, activeRole, isLoading, isSwitchingAuth } = useAuth(); 

    // 1. אם המערכת בטעינה ראשונית *או* בתהליך החלפת זהות, הצג טעינה.
    if (isLoading || isSwitchingAuth) {
        return <div className="loading">מאמת פרטי משתמש...</div>;
    }

    // אחרי שהכל הסתיים:
    // 2. בדוק אם המשתמש מחובר.
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // 3. בדוק אם יש לו הרשאה לדף הספציפי.
    const hasPermission = activeRole && allowedRoles.includes(activeRole);

    // 4. הצג את הדף או העבר לדף "אין הרשאה".
    return hasPermission ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;