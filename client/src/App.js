import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import DayViewPage from './pages/DayViewPage'; // נוסיף תכף
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';
import NewAppointmentPage from './pages/NewAppointmentPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/day/:date" element={<DayViewPage />} /> {/* תצוגת יום */}
            <Route path="/new-appointment" element={<NewAppointmentPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
