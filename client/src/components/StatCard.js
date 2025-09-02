import React from 'react';
import '../styles/StatCard.css';

function StatCard({ label, value, icon }) {
    return (
        <div className="stat-card-pro">
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-info">
                <span className="stat-card-value">{value}</span>
                <span className="stat-card-label">{label}</span>
            </div>
        </div>
    );
}

export default StatCard;