import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';
import api from '../services/api';

const AuthContext = createContext(null);

const getDashboardPathForRole = (role) => {
    switch (role) {
        case 'owner':
            return '/owner-dashboard';
        case 'admin':
        case 'trainer':
        case 'member':
            return '/dashboard';
        default:
            return '/';
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
            setupSession(data);
        } catch (error) {
            setupSession(null);
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
    
    const switchRole = (newRole) => {
        if (!studios || !activeStudio) return;

        const currentStudioHasRole = activeStudio.roles.includes(newRole);

        if (currentStudioHasRole) {
            setActiveRole(newRole);
            localStorage.setItem('activeRole', newRole);
            navigate(getDashboardPathForRole(newRole));
        } else {
            const targetStudio = studios.find(studio => studio.roles.includes(newRole));

            if (targetStudio) {
                setActiveStudio(targetStudio);
                setActiveRole(newRole);
                api.setStudioId(targetStudio.studio_id); 
                
                localStorage.setItem('activeStudioId', targetStudio.studio_id);
                localStorage.setItem('activeRole', newRole);
                
                navigate(getDashboardPathForRole(newRole));
            } else {
                console.error(`Attempted to switch to role '${newRole}', but no studio was found for this role.`);
            }
        }
    };

    const value = { user, isLoading, studios, activeStudio, activeRole, switchStudio, switchRole, login, logout, setupSession, refreshUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}