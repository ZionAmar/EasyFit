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
    
    const refreshUser = async () => {
        try {
            const data = await authService.verify();
            if (data && data.userDetails) {
                setupSession(data);
            }
        } catch (error) {
            console.error("Failed to refresh user data, logging out.", error);
            logout();
        }
    };

    const register = async (userData) => {
        const dataToRegister = { ...userData, studioId: 1 }; 
        return await authService.register(dataToRegister);
    };

    const switchStudio = (studioId) => {
        const newActiveStudio = studios.find(s => s.studio_id === parseInt(studioId));
        if (newActiveStudio) {
            setActiveStudio(newActiveStudio);
            api.setStudioId(newActiveStudio.studio_id);
            window.location.reload();
        }
    };
    
    const switchRole = (newRole) => {
        if (activeStudio && activeStudio.roles.includes(newRole)) {
            setActiveRole(newRole);
        }
    };
 
    const value = { user, isLoading, studios, activeStudio, activeRole, switchStudio, switchRole, login, logout, register, refreshUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}

