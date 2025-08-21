import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/auth.service';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [studios, setStudios] = useState([]);
    const [activeStudio, setActiveStudio] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const setupSession = (data) => {
        const { userDetails, studios: userStudios } = data;
        setUser(userDetails);

        // שלב חשוב: מקבצים את התפקידים לכל סטודיו למבנה נתונים נוח
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
            const defaultStudio = studiosWithRoles.find(s => s.studio_id == initialStudioId) || studiosWithRoles[0];
            
            setActiveStudio(defaultStudio);
            api.setStudioId(defaultStudio.studio_id);
            
            // קובעים תפקיד ברירת מחדל מהסטודיו הפעיל
            // נותנים עדיפות לתפקיד בכיר יותר אם קיים
            const preferredRole = ['admin', 'trainer', 'member'].find(r => defaultStudio.roles.includes(r));
            setActiveRole(preferredRole);
        }
    };

    useEffect(() => {
        async function verifyUser() {
            try {
                const data = await authService.verify();
                if (data && data.userDetails) {
                    setupSession(data);
                }
            } catch (error) {
                // User is not logged in, state remains null
            } finally {
                setIsLoading(false);
            }
        }
        verifyUser();
    }, []);

    const login = async (userName, pass) => {
        const data = await authService.login(userName, pass);
        setupSession(data);
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
        }
    };

    const switchStudio = (studioId) => {
        const newActiveStudio = studios.find(s => s.studio_id === parseInt(studioId));
        if (newActiveStudio) {
            setActiveStudio(newActiveStudio);
            api.setStudioId(newActiveStudio.studio_id);
            window.location.reload(); // The easiest way to refetch all data for the new context
        }
    };
    
    const switchRole = (newRole) => {
        if (activeStudio && activeStudio.roles.includes(newRole)) {
            setActiveRole(newRole);
            console.log(`Switched to role: ${newRole}`);
        }
    };
  
    const value = { user, isLoading, studios, activeStudio, activeRole, switchStudio, switchRole, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}