// >> קובץ: context/AuthContext.js
// >> תיקון: שמירת המידע הנכון ב-state לאחר התחברות.

import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      try {
        const userData = await authService.verify();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    verifyUser();
  }, []);

  const login = async (userName, pass) => {
    // FIX: השרת מחזיר ישירות את אובייקט המשתמש. אין צורך בפירוק נוסף.
    const loggedInUser = await authService.login(userName, pass);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    return authService.register(userData);
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = { user, isLoading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}