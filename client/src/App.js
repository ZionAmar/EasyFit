import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import './App.css';

// The main router component
function AppRouter() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(user ? 'dashboard' : 'home');

  // While checking user status, show a loading message
  if (isLoading) {
    return <div className="loading">טוען נתונים...</div>;
  }

  // Navigation logic
  let pageComponent;
  switch (currentPage) {
    case 'login':
      pageComponent = <LoginPage setCurrentPage={setCurrentPage} />;
      break;
    case 'register':
      pageComponent = <RegisterPage setCurrentPage={setCurrentPage} />;
      break;
    case 'dashboard':
      // Protected Route: only show if user is logged in
      pageComponent = user ? <DashboardPage /> : <LoginPage setCurrentPage={setCurrentPage} />;
      break;
    default:
      pageComponent = <HomePage />;
  }

  return (
    <>
      <Navbar user={user} setCurrentPage={setCurrentPage} />
      <main className="container">
        {pageComponent}
      </main>
    </>
  );
}

// The main App component that wraps everything with the AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
