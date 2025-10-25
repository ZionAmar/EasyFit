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
    const [currentPage, setCurrentPage] = useState(1);
    const [studiosPerPage] = useState(10);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchStudios = useCallback(async () => {
        setIsLoading(true);
        try {
            const studiosData = await api.get('/api/studio/all');
            const parsedStudios = studiosData.map(studio => {
                let adminsArray = [];
                // Defensive parsing to handle both stringified JSON and actual arrays
                if (typeof studio.admins === 'string') {
                    try {
                        adminsArray = JSON.parse(studio.admins);
                    } catch (e) {
                        console.error("Failed to parse admins JSON for studio:", studio.id, e);
                    }
                } else if (Array.isArray(studio.admins)) {
                    adminsArray = studio.admins;
                }
                // Filter out any potential null entries that might come from the LEFT JOIN
                return { ...studio, admins: adminsArray.filter(admin => admin && admin.id != null) };
            });
            setStudios(parsedStudios || []);
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

    const handleImpersonate = async (studioId, adminId, adminName) => {
        if (window.confirm(`האם להתחבר למערכת בתור ${adminName}?`)) {
            try {
                await api.post(`/api/auth/impersonate/${adminId}`);
                // Set the target studio ID in localStorage before reloading
                localStorage.setItem('activeStudioId', studioId);
                // Force a full reload to ensure the app re-initializes with the new identity
                window.location.href = '/dashboard';
            } catch (error) {
                alert(`שגיאה בהתחזות: ${error.message}`);
            }
        }
    };

    const filteredStudios = studios.filter(studio => {
        const adminNames = studio.admins.map(a => a.full_name).join(' ').toLowerCase();
        return studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               adminNames.includes(searchTerm.toLowerCase());
    });

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
                                <th>מנהלים</th>
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
                                        <td>
                                            {studio.admins && studio.admins.length > 0 ? (
                                                <ul className="admin-list">
                                                    {studio.admins.map(admin => <li key={admin.id}>{admin.full_name}</li>)}
                                                </ul>
                                            ) : (
                                                <span style={{opacity: 0.5}}>אין מנהל</span>
                                            )}
                                        </td>
                                        <td><span className={`status-badge ${studio.subscription_status}`}>{studio.subscription_status}</span></td>
                                        <td className="actions-cell">
                                            <button className="btn btn-secondary" onClick={() => handleOpenModal(studio)}>ערוך</button>
                                            <button className="btn btn-danger" onClick={() => handleDelete(studio.id)}>מחק</button>
                                            
                                            {studio.admins && studio.admins.length === 1 && (
                                                <button className="btn" onClick={() => handleImpersonate(studio.id, studio.admins[0].id, studio.admins[0].full_name)}>
                                                    התחבר כמנהל
                                                </button>
                                            )}
                                            {studio.admins && studio.admins.length > 1 && (
                                                <div className="dropdown">
                                                    <button className="btn" onClick={() => setOpenDropdownId(openDropdownId === studio.id ? null : studio.id)}>
                                                        התחבר בתור...
                                                    </button>
                                                    {openDropdownId === studio.id && (
                                                        <div className="dropdown-menu">
                                                            {studio.admins.map(admin => (
                                                                <div key={admin.id} className="dropdown-item" onClick={() => handleImpersonate(studio.id, admin.id, admin.full_name)}>
                                                                    {admin.full_name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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