import React from 'react';

function StatCard({ title, value }) {
  return (
    <div className="stat-card card">
      <span className="stat-value">{value}</span>
      <span className="stat-title">{title}</span>
    </div>
  );
}

export default StatCard;