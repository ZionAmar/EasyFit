import React, { useState } from 'react';
import '../styles/MultiSelect.css'; // ניצור קובץ עיצוב קטן

function MultiSelect({ options, selected, onChange, placeholder = "בחר..." }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (optionValue) => {
        if (selected.includes(optionValue)) {
            onChange(selected.filter(item => item !== optionValue));
        } else {
            onChange([...selected, optionValue]);
        }
    };
    
    const selectedLabels = options
        .filter(opt => selected.includes(opt.value))
        .map(opt => opt.label)
        .join(', ');

    return (
        <div className="multiselect-container">
            <div className="multiselect-display" onClick={() => setIsOpen(!isOpen)}>
                {selectedLabels || placeholder}
            </div>
            {isOpen && (
                <div className="multiselect-options">
                    {options.map(option => (
                        <div key={option.value} className="multiselect-option">
                            <input 
                                type="checkbox"
                                id={`ms-opt-${option.value}`}
                                checked={selected.includes(option.value)}
                                onChange={() => handleSelect(option.value)}
                            />
                            <label htmlFor={`ms-opt-${option.value}`}>{option.label}</label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MultiSelect;