import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ManageUserModal from './ManageUserModal';
import CreateUserModal from './CreateUserModal';

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


function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [allStudios, setAllStudios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
    
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [usersData, studiosData] = await Promise.all([
                api.get('/api/users/system/all'),
                api.get('/api/studio/all')
            ]);
            setUsers(usersData || []);
            setAllStudios(studiosData || []);
        } catch (err) {
            setError(err.message || 'שגיאה בטעינת הנתונים.');
            setUsers([]);
            setAllStudios([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenManageModal = (user) => {
        setError('');
        setSelectedUser(user);
        setIsManageModalOpen(true);
    };
    
    const handleOpenCreateModal = () => {
        setError('');
        setIsCreateModalOpen(true);
    };

    const handleCloseModals = () => {
        setSelectedUser(null);
        setIsManageModalOpen(false);
        setIsCreateModalOpen(false);
        setError('');
    };
    
    const filteredUsers = users.filter(user =>
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.userName && user.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    if (isLoading && !isManageModalOpen && !isCreateModalOpen) {
        return <div className="loading">טוען רשימת משתמשים...</div>;
    }
    
    if (error && !isManageModalOpen && !isCreateModalOpen) {
        return <div className="error-state"><h2 style={{ color: '#dc3545' }}>❌ שגיאה בטעינת הנתונים:</h2><p>{error}</p></div>;
    }

    return (
        <>
            <div className="card-pro">
                <div className="card-header">
                    <div className="card-header-title">
                        <h2>רשימת משתמשים ({filteredUsers.length})</h2>
                    </div>
                    <div className="header-actions-inline" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                         <input
                            type="text"
                            placeholder="חפש משתמש..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleOpenCreateModal}>הוסף משתמש</button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="studios-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>שם מלא</th>
                                <th>אימייל</th>
                                <th>שיוך ותפקידים</th>
                                <th>סטטוס</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.full_name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {user.roles && user.roles.length > 0
                                                ? user.roles.map(r => (
                                                    <div key={`${r.studio_id}-${r.role_name}`}>
                                                        <strong>{r.studio_name}</strong> ({r.role_name})
                                                    </div>
                                                ))
                                                : <span style={{opacity: 0.5}}>לא משויך</span>}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.status === 'active' ? 'active' : 'canceled'}`}>{user.status}</span>
                                        </td>
                                        <td className="actions-cell">
                                            <button className="btn btn-secondary" onClick={() => handleOpenManageModal(user)}>ניהול</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        {searchTerm ? 'לא נמצאו משתמשים התואמים לחיפוש.' : 'לא קיימים משתמשים במערכת.'}
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
            
            {isManageModalOpen && (
                <ManageUserModal 
                    user={selectedUser} 
                    allStudios={allStudios}
                    onClose={handleCloseModals} 
                    onSave={fetchData} 
                />
            )}

            {isCreateModalOpen && (
                <CreateUserModal
                    onClose={handleCloseModals}
                    onSave={fetchData}
                />
            )}
        </>
    );
}

export default UsersManagement;