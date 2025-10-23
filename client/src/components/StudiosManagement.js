import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StudioModal from './StudioModal';
import { useAuth } from '../context/AuthContext';

// רכיב הדפדוף מוגדר כאן, בתוך הקובץ
const Pagination = ({ currentPage, totalPages, onNext, onPrev }) => {
    if (totalPages <= 1) {
        return null;
    }
    return (
        <div className="pagination-controls">
            <button onClick={onPrev} disabled={currentPage === 1} className="pagination-btn">
                → הקודם
            </button>
            <span className="page-indicator">
                עמוד {currentPage} מתוך {totalPages}
            </span>
            <button onClick={onNext} disabled={currentPage === totalPages} className="pagination-btn">
                הבא ←
            </button>
        </div>
    );
};

function StudiosManagement() {
    const [studios, setStudios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // אנחנו לא צריכים את useNavigate או refreshUser כאן
    const { setupSession } = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const [studiosPerPage] = useState(5);

    const fetchStudios = useCallback(async () => {
        setIsLoading(true);
        try {
            const studiosData = await api.get('/api/studio/all');
            setStudios(studiosData || []);
        } catch (error) {
            console.error("Failed to fetch studios:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudios();
    }, [fetchStudios]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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

    // --- ⬇️ הפונקציה המעודכנת והסופית ⬇️ ---
    const handleImpersonate = async (studio) => {
        if (!studio.admin_user_id) {
            return alert('לסטודיו זה לא משויך מנהל.');
        }
        if (window.confirm(`האם להתחבר למערכת בתור ${studio.admin_full_name}?`)) {
            try {
                // שלב 1: קבלת הטוקן החדש וגם את רשימת הסטודיואים של המנהל
                const data = await api.post(`/api/auth/impersonate/${studio.admin_user_id}`);
                
                // שלב 2: בדוק אם למנהל יש סטודיואים משויכים
                if (data && data.studios && data.studios.length > 0) {
                    // שלב 3: שמור את ה-ID של הסטודיו הראשון שלו ב-localStorage
                    const firstStudioId = data.studios[0].studio_id;
                    localStorage.setItem('activeStudioId', firstStudioId);
                } else {
                    // אם למנהל אין סטודיו, נקה את המזהה הקודם למקרה שקיים
                    localStorage.removeItem('activeStudioId');
                }
                
                // שלב 4: רק עכשיו, כפה ריענון מלא של הדף.
                // כשהאפליקציה תיטען מחדש, היא תקרא את ה-ID הנכון מה-localStorage.
                window.location.href = '/dashboard';

            } catch (error) {
                alert(`שגיאה בהתחזות: ${error.message}`);
            }
        }
    };

    const filteredStudios = studios.filter(studio =>
        studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (studio.admin_full_name && studio.admin_full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredStudios.length / studiosPerPage);
    const indexOfLastStudio = currentPage * studiosPerPage;
    const indexOfFirstStudio = indexOfLastStudio - studiosPerPage;
    const currentStudios = filteredStudios.slice(indexOfFirstStudio, indexOfLastStudio);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (isLoading) {
        return <div className="loading">טוען רשימת סטודיואים...</div>;
    }

    return (
        <>
            <div className="card-pro">
                <div className="card-header">
                    <div className="card-header-title">
                        <h2>רשימת סטודיואים ({filteredStudios.length})</h2>
                    </div>
                    <div className="header-actions-inline" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                         <input
                            type="text"
                            placeholder="חפש סטודיו או מנהל..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>הוסף סטודיו חדש</button>
                    </div>
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
                            {currentStudios.length > 0 ? (
                                currentStudios.map(studio => (
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
                                        {searchTerm ? 'לא נמצאו סטודיואים תואמים לחיפוש.' : "לא קיימים סטודיואים במערכת."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="card-footer" style={{display: 'flex', justifyContent: 'center', paddingTop: '1.5rem'}}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onNext={handleNextPage}
                        onPrev={handlePrevPage}
                    />
                </div>
            </div>
            
            {isModalOpen && (
                <StudioModal
                    studio={selectedStudio}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </>
    );
}

export default StudiosManagement;