import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // >>> הוספה: State חדש שיחזיק את התפקיד הפעיל הנוכחי
  const [activeRole, setActiveRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      try {
        const userData = await authService.verify();
        setUser(userData);
        // >>> הוספה: קביעת תפקיד ברירת המחדל בטעינת האפליקציה
        if (userData.roles.includes('admin')) {
          setActiveRole('admin');
        } else if (userData.roles.includes('trainer')) {
          setActiveRole('trainer');
        } else if (userData.roles.includes('member')) {
          setActiveRole('member');
        }
      } catch (error) {
        setUser(null);
        setActiveRole(null); // >>> הוספה: איפוס התפקיד אם האימות נכשל
      } finally {
        setIsLoading(false);
      }
    }
    verifyUser();
  }, []);

  const login = async (userName, pass) => {
    const loggedInUser = await authService.login(userName, pass);
    setUser(loggedInUser);
    
    // >>> הוספה: קביעת תפקיד ברירת המחדל אחרי התחברות
    if (loggedInUser.roles.includes('admin')) {
      setActiveRole('admin');
    } else if (loggedInUser.roles.includes('trainer')) {
      setActiveRole('trainer');
    } else if (loggedInUser.roles.includes('member')) {
      setActiveRole('member');
    }

    return loggedInUser;
  };

  const register = async (userData) => {
    return authService.register(userData);
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setActiveRole(null); // >>> הוספה: איפוס התפקיד ביציאה
  };
  
  // >>> הוספה: פונקציה שתאפשר לרכיבים אחרים לשנות את התפקיד הפעיל
  const switchRole = (newRole) => {
    // בודקים שהמשתמש באמת מחזיק בתפקיד הזה לפני שמבצעים את השינוי
    if (user && user.roles.includes(newRole)) {
      setActiveRole(newRole);
      console.log(`Switched to ${newRole} view`); // לוג לבדיקה
    }
  };

  // >>> עדכון: הוספנו את המשתנים והפונקציות החדשות ל-value
  const value = { user, isLoading, activeRole, switchRole, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}