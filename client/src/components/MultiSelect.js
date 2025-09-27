import React, { useState } from 'react';
import '../styles/MultiSelect.css';

function MultiSelect({ options, selected, onChange, placeholder = "בחר..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelect = (optionValue) => {
        if (selected.includes(optionValue)) {
            onChange(selected.filter(item => item !== optionValue));
        } else {
            onChange([...selected, optionValue]);
        }
    };

    const selectedItems = options.filter(opt => selected.includes(opt.value));
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="multiselect-container">
            <div className="multiselect-display" onClick={() => setIsOpen(!isOpen)}>
                {selectedItems.length > 0 ? (
                    selectedItems.map(item => (
                        <span key={item.value} className="selected-item-tag">
                            {item.label}
                            <button className="remove-tag-btn" onClick={(e) => {
                                e.stopPropagation(); // Prevent dropdown from opening
                                handleSelect(item.value);
                            }}>&times;</button>
                        </span>
                    ))
                ) : (
                    <span className="placeholder-text">{placeholder}</span>
                )}
            </div>
            {isOpen && (
                <div className="multiselect-options">
                    <div className="multiselect-search">
                        <input
                            type="text"
                            placeholder="חפש משתתפים..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {filteredOptions.map(option => (
                        <div key={option.value} className="multiselect-option" onClick={() => handleSelect(option.value)}>
                             <input 
                                type="checkbox"
                                checked={selected.includes(option.value)}
                                readOnly
                            />
                            <label>{option.label}</label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MultiSelect;