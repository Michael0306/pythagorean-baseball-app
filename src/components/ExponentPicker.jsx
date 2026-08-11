import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function ExponentPicker({ exponent, onChangeExponent }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Generate options from 1.5 to 2.5 step 0.1, plus default 1.83
  const options = [];
  for (let val = 1.5; val <= 2.501; val += 0.1) {
    const formatted = parseFloat(val.toFixed(1));
    options.push({ value: formatted, label: `${formatted.toFixed(2)}` });
  }

  // Insert 1.83 if not explicitly added
  if (!options.some((o) => o.value === 1.83)) {
    options.push({ value: 1.83, label: '1.83 (기본)' });
    options.sort((a, b) => a.value - b.value);
  }

  // Format active label
  const activeOption = options.find((o) => Math.abs(o.value - exponent) < 0.001);
  const buttonLabel = activeOption
    ? exponent === 1.83
      ? '지수 1.83 (기본)'
      : `지수 ${exponent.toFixed(2)}`
    : `지수 ${exponent.toFixed(2)}`;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="floating-exponent-container" ref={dropdownRef}>
      <button className="exponent-btn" onClick={() => setIsOpen(!isOpen)}>
        <span>{buttonLabel}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="exponent-menu">
          <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            피타고리안 지수 선택
          </div>
          {options.map((opt) => {
            const isSelected = Math.abs(opt.value - exponent) < 0.001;
            return (
              <button
                key={opt.value}
                className={`exponent-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onChangeExponent(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.value === 1.83 ? '1.83 (기본)' : opt.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
