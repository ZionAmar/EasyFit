import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StudioModal from '../components/StudioModal';
import { useAuth } from '../context/AuthContext';
import '../styles/OwnerDashboard.css';

function OwnerDashboardPage() {
    const [studios, setStudios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { setupSession } = useAuth();

    const fetchStudios = useCallback(async () => {
        try {
            setIsLoading(true);
            const studiosData = await api.get('/api/studio/all');
            setStudios(studiosData || []);
        } catch (error) {
            console.error("Failed to fetch studios:", error);
            setStudios([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudios();
    }, [fetchStudios]);

    const handleOpenModal = (studio = null) => {
        setSelectedStudio(studio);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedStudio(null);
        setIsModalOpen(false);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchStudios();
    };

    const handleDelete = async (studioId) => {
        if (window.confirm('האם אתה בטוח? פעולה זו תמחק את הסטודיו וכל המידע הקשור אליו.')) {
            try {
                await api.delete(`/api/studio/${studioId}`);
                fetchStudios();
            } catch (error) {
                alert(`שגיאה במחיקת הסטודיו: ${error.message}`);
            }
        }
    };

    const handleImpersonate = async (studio) => {
        if (!studio.admin_user_id) {
            return alert('לסטודיו זה לא משויך מנהל.');
        }
        if (window.confirm(`האם להתחבר למערכת בתור ${studio.admin_full_name}?`)) {
            try {
                const data = await api.post(`/api/auth/impersonate/${studio.admin_user_id}`);
                const roleType = setupSession(data);
                if (roleType === 'user') {
                    window.location.href = '/dashboard';
                }
            } catch (error) {
                alert(`שגיאה בהתחזות: ${error.message}`);
            }
        }
    };

    const filteredStudios = studios.filter(studio =>
        studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (studio.admin_full_name && studio.admin_full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return <div className="loading">טוען רשימת סטודיואים...</div>;
    }

    return (
        <div className="pro-dashboard">
            <div className="dashboard-header-pro">
                <div className="header-text">
                    <h1>דשבורד ניהול ראשי</h1>
                    <p>מכאן תוכל לנהל את כל הסטודיואים הרשומים במערכת FiTime.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>הוסף סטודיו חדש</button>
                </div>
            </div>

            <div className="card-pro">
                <div className="card-header">
                    <div className="card-header-title">
                        <span className="card-icon">🏢</span>
                        <h2>רשימת סטודיואים ({filteredStudios.length})</h2>
                    </div>
                    <input
                        type="text"
                        placeholder="חפש..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="studios-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>שם הסטודיו</th>
                                <th>שם המנהל</th>
                                <th>סטטוס מנוי</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudios.length > 0 ? (
                                filteredStudios.map(studio => (
                                    <tr key={studio.id}>
                                        <td>{studio.id}</td>
                                        <td>{studio.name}</td>
                                        <td>{studio.admin_full_name || <span style={{opacity: 0.5}}>אין מנהל</span>}</td>
                                        <td><span className={`status-badge ${studio.subscription_status}`}>{studio.subscription_status}</span></td>
                                        <td className="actions-cell">
                                            <button className="btn btn-secondary" onClick={() => handleOpenModal(studio)}>ערוך</button>
                                            <button className="btn btn-danger" onClick={() => handleDelete(studio.id)}>מחק</button>
                                            <button className="btn" onClick={() => handleImpersonate(studio)} disabled={!studio.admin_user_id}>התחבר כמנהל</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        {searchTerm ? 'לא נמצאו סטודיואים תואמים לחיפוש.' : "לא נמצאו סטודיואים. לחץ על 'הוסף סטודיו חדש' כדי להתחיל."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <StudioModal
                    studio={selectedStudio}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default OwnerDashboardPage;