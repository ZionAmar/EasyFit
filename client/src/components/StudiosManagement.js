import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StudioModal from './StudioModal';
import { useAuth } from '../context/AuthContext';

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
    const [error, setError] = useState('');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [confirmingImpersonateId, setConfirmingImpersonateId] = useState(null);

    const resetMessages = () => {
        setError('');
        setConfirmingDeleteId(null);
        setConfirmingImpersonateId(null);
    };

    const fetchStudios = useCallback(async () => {
        setIsLoading(true);
        resetMessages();
        try {
            const studiosData = await api.get('/api/studio/all');
            const parsedStudios = studiosData.map(studio => {
                let adminsArray = [];
                if (typeof studio.admins === 'string') {
                    try {
                        adminsArray = JSON.parse(studio.admins);
                    } catch (e) {
                        console.error("Failed to parse admins JSON for studio:", studio.id, e);
                    }
                } else if (Array.isArray(studio.admins)) {
                    adminsArray = studio.admins;
                }
                return { ...studio, admins: adminsArray.filter(admin => admin && admin.id != null) };
            });
            setStudios(parsedStudios || []);
        } catch (err) {
            setError(err.message || "שגיאה בטעינת רשימת הסטודיואים.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudios();
    }, [fetchStudios]);

    useEffect(() => {
        setCurrentPage(1);
        resetMessages();
    }, [searchTerm]);

    const handleOpenModal = (studio = null) => {
        resetMessages();
        setSelectedStudio(studio);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedStudio(null);
        setIsModalOpen(false);
        resetMessages();
    };

    const handleSave = () => {
        handleCloseModal();
        fetchStudios();
    };

    const handleDelete = async (studioId, studioName) => {
        if (confirmingDeleteId !== studioId) {
            resetMessages();
            setConfirmingDeleteId(studioId);
            setError(`האם למחוק את ${studioName}? לחץ שוב לאישור.`);
            return;
        }

        setIsLoading(true);
        resetMessages();
        try {
            await api.delete(`/api/studio/${studioId}`);
            fetchStudios();
        } catch (err) {
            setError(err.message || 'שגיאה במחיקת הסטודיו.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImpersonate = async (studioId, adminId, adminName) => {
        if (confirmingImpersonateId !== adminId) {
            resetMessages();
            setConfirmingImpersonateId(adminId);
            setError(`האם להתחבר למערכת בתור ${adminName}? לחץ שוב לאישור.`);
            return;
        }
        
        resetMessages();
        try {
            await api.post(`/api/auth/impersonate/${adminId}`);
            localStorage.setItem('activeStudioId', studioId);
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.message || 'שגיאה בהתחברות.');
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

    if (isLoading && studios.length === 0) {
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

                {error && <p className={`error ${confirmingDeleteId || confirmingImpersonateId ? 'confirm-message' : ''}`} style={{ padding: '0 20px' }}>{error}</p>}
                
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
                                            <button 
                                                className={`btn ${confirmingDeleteId === studio.id ? 'btn-danger-confirm' : 'btn-danger'}`} 
                                                onClick={() => handleDelete(studio.id, studio.name)}>
                                                {confirmingDeleteId === studio.id ? 'אשר מחיקה' : 'מחק'}
                                            </button>
                                            
                                            {studio.admins && studio.admins.length === 1 && (
                                                <button 
                                                    className={`btn ${confirmingImpersonateId === studio.admins[0].id ? 'btn-danger-confirm' : ''}`} 
                                                    onClick={() => handleImpersonate(studio.id, studio.admins[0].id, studio.admins[0].full_name)}>
                                                    {confirmingImpersonateId === studio.admins[0].id ? 'אשר התחברות' : 'התחבר כמנהל'}
                                                </button>
                                            )}
                                            {studio.admins && studio.admins.length > 1 && (
                                                <div className="dropdown">
                                                    <button className="btn" onClick={() => { setOpenDropdownId(openDropdownId === studio.id ? null : studio.id); resetMessages(); }}>
                                                        התחבר בתור...
                                                    </button>
                                                    {openDropdownId === studio.id && (
                                                        <div className="dropdown-menu">
                                                            {studio.admins.map(admin => (
                                                                <div 
                                                                    key={admin.id} 
                                                                    className={`dropdown-item ${confirmingImpersonateId === admin.id ? 'confirm-impersonate' : ''}`} 
                                                                    onClick={() => handleImpersonate(studio.id, admin.id, admin.full_name)}>
                                                                    {confirmingImpersonateId === admin.id ? 'לחץ לאישור' : admin.full_name}
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