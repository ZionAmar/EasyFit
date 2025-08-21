// קובץ: components/StudioSwitcher.js

import React from 'react';
import { useAuth } from '../context/AuthContext';

function StudioSwitcher() {
    const { studios, activeStudio, switchStudio } = useAuth();

    // אם למשתמש אין סטודיואים או יש לו רק אחד, אל תציג את התפריט
    if (!studios || studios.length <= 1) {
        return <span className="active-studio-name">{activeStudio?.studio_name}</span>;
    }

    const handleStudioChange = (e) => {
        switchStudio(e.target.value);
    };

    return (
        <div className="studio-switcher">
            <select
                value={activeStudio?.studio_id}
                onChange={handleStudioChange}
                className="studio-select"
            >
                {studios.map(studio => (
                    <option key={studio.studio_id} value={studio.studio_id}>
                        {studio.studio_name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default StudioSwitcher;