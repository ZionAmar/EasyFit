import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';
import api from '../services/api';

const AuthContext = createContext(null);

// --- ⬇️ הוספנו פונקציית עזר קטנה ונקייה ⬇️ ---
// פונקציה זו מחזירה את דף הבית המתאים לכל תפקיד
const getDashboardPathForRole = (role) => {
    switch (role) {
        case 'owner':
            return '/owner-dashboard';
        case 'admin':
        case 'trainer':
        case 'member':
            return '/dashboard';
        default:
            return '/'; // במקרה שלא נמצא תפקיד, חזור לדף הבית
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [studios, setStudios] = useState([]);
    const [activeStudio, setActiveStudio] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const setupSession = useCallback((data) => {
        if (!data || !data.userDetails) {
            setUser(null);
            setStudios([]);
            setActiveStudio(null);
            setActiveRole(null);
            api.setStudioId(null);
            return null;
        }

        const { userDetails, studios: userStudios } = data;
        setUser(userDetails);

        const isOwner = userStudios.some(studioRole => studioRole.role_name === 'owner');
        if (isOwner) {
            setStudios([]);
            setActiveStudio(null);
            setActiveRole('owner');
            api.setStudioId(null);
            return 'owner';
        }
        
        const studiosMap = new Map();
        userStudios.forEach(({ studio_id, studio_name, role_name }) => {
            if (!studiosMap.has(studio_id)) {
                studiosMap.set(studio_id, { studio_id, studio_name, roles: [] });
            }
            studiosMap.get(studio_id).roles.push(role_name);
        });
        const studiosWithRoles = Array.from(studiosMap.values());
        setStudios(studiosWithRoles);

        if (studiosWithRoles.length > 0) {
            const initialStudioId = localStorage.getItem('activeStudioId');
            const defaultStudio = studiosWithRoles.find(s => s.studio_id === parseInt(initialStudioId)) || studiosWithRoles[0];
            
            setActiveStudio(defaultStudio);
            api.setStudioId(defaultStudio.studio_id);
            localStorage.setItem('activeStudioId', defaultStudio.studio_id);
            
            // On initial load, try to keep the stored role if it's still valid
            const storedRole = localStorage.getItem('activeRole');
            const preferredRole = defaultStudio.roles.includes(storedRole) 
                ? storedRole 
                : ['admin', 'trainer', 'member'].find(r => defaultStudio.roles.includes(r));

            setActiveRole(preferredRole);
            localStorage.setItem('activeRole', preferredRole);
            return 'user';
        }
        return null;
    }, []);

    const verifyAndSetupUser = useCallback(async () => {
        try {
            const data = await authService.verify();
            setupSession(data); // setupSession will handle null data correctly
        } catch (error) {
            setupSession(null); // Clear session on any verification error
        }
    }, [setupSession]);


    useEffect(() => {
        const initialLoad = async () => {
            await verifyAndSetupUser();
            setIsLoading(false);
        }
        initialLoad();
    }, [verifyAndSetupUser]);

    const login = async (userName, pass) => {
        const data = await authService.login(userName, pass);
        const roleType = setupSession(data);
        
        if (roleType === 'owner') {
            navigate('/owner-dashboard');
        } else if (roleType === 'user') {
            navigate('/dashboard');
        }
        return data;
    };
 
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            setStudios([]);
            setActiveStudio(null);
            setActiveRole(null);
            api.setStudioId(null);
            localStorage.clear();
            navigate('/');
        }
    };
    
    const refreshUser = async () => {
        setIsLoading(true);
        const roleType = await verifyAndSetupUser();
        setIsLoading(false);
        return roleType;
    };

    const switchStudio = (studioId) => {
        const newActiveStudio = studios.find(s => s.studio_id === parseInt(studioId));
        if (newActiveStudio) {
            localStorage.setItem('activeStudioId', newActiveStudio.studio_id);
            const preferredRole = ['admin', 'trainer', 'member'].find(r => newActiveStudio.roles.includes(r));
            localStorage.setItem('activeRole', preferredRole);
            window.location.reload();
        }
    };
    
    // --- ⬇️ הנה הפונקציה המתוקנת ⬇️ ---
    const switchRole = (newRole) => {
        if (activeStudio && activeStudio.roles.includes(newRole)) {
            // שלב 1: עדכן את התפקיד בזיכרון ובאחסון המקומי
            setActiveRole(newRole);
            localStorage.setItem('activeRole', newRole);

            // שלב 2: מצא את דף הבית המתאים לתפקיד החדש
            const destinationPath = getDashboardPathForRole(newRole);

            // שלב 3: נווט את המשתמש לדף הבטוח הזה
            navigate(destinationPath);
        }
    };
 
    const value = { user, isLoading, studios, activeStudio, activeRole, switchStudio, switchRole, login, logout, setupSession, refreshUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}