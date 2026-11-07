import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { siteSettings } from '../siteSettings';
import { useSchool } from '../context/SchoolContext';

// People arrive on these pages from an email link; don't cover them with the pop-up.
const HIDDEN_ON = ['/verify-email', '/reset-password'];

/** "Where do you go to school?" pop-up. Picking a school recolors the site. */
const SchoolPicker: React.FC = () => {
  const { school, chooseSchool, pickerOpen, dismissPicker } = useSchool();
  const location = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const visible = pickerOpen && !HIDDEN_ON.includes(location.pathname);

  useEffect(() => {
    if (!visible) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstButton = dialogRef.current?.querySelector<HTMLButtonElement>('.school-option');
    firstButton?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissPicker();
      } else if (e.key === 'Tab' && dialogRef.current) {
        // Keep keyboard focus inside the pop-up.
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [visible, dismissPicker]);

  if (!visible) return null;

  return (
    <div className="school-picker-backdrop" onClick={dismissPicker}>
      <div
        ref={dialogRef}
        className="school-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="school-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="school-picker__close" onClick={dismissPicker} aria-label="Close">
          ×
        </button>
        <h2 id="school-picker-title" className="school-picker__title">Where do you go to school?</h2>
        <p className="school-picker__subtitle">
          We'll put the neighborhoods closest to your campus first. You can change this anytime from the top of the page.
        </p>
        <div className="school-picker__grid">
          {siteSettings.schools.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`school-option${school?.id === option.id ? ' school-option--current' : ''}`}
              style={{ backgroundColor: option.colors.background, color: option.colors.text }}
              aria-pressed={school?.id === option.id}
              onClick={() => chooseSchool(option)}
            >
              <span className="school-option__short">{option.shortName}</span>
              {option.shortName !== option.name && <span className="school-option__name">{option.name}</span>}
            </button>
          ))}
        </div>
        <button type="button" className="school-picker__skip" onClick={() => chooseSchool(undefined)}>
          I'm not a student / my school isn't listed
        </button>
      </div>
    </div>
  );
};

export default SchoolPicker;
