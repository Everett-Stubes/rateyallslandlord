import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { applySchoolTheme, findSchool, type School } from '../utils/schools';

const SCHOOL_KEY = 'ryl.school';
// Set for the rest of the visit when someone closes the pop-up without picking.
const SKIPPED_KEY = 'ryl.schoolPickerSkipped';

const read = (storage: () => Storage, key: string): string | null => {
  try { return storage().getItem(key); } catch { return null; }
};
const write = (storage: () => Storage, key: string, value: string | null) => {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch { /* storage blocked: the choice lasts until the page reloads */ }
};
const local = () => window.localStorage;
const session = () => window.sessionStorage;

interface SchoolContextType {
  school: School | undefined;
  /** Pass undefined for "not a student / just browsing", which keeps the default colors. */
  chooseSchool: (school: School | undefined) => void;
  pickerOpen: boolean;
  openPicker: () => void;
  /** Close without choosing; asks again on the next visit. */
  dismissPicker: () => void;
}

const SchoolContext = createContext<SchoolContextType | null>(null);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [school, setSchool] = useState<School | undefined>(() => findSchool(read(local, SCHOOL_KEY)));
  const [pickerOpen, setPickerOpen] = useState(
    () => read(local, SCHOOL_KEY) === null && read(session, SKIPPED_KEY) === null
  );

  useLayoutEffect(() => applySchoolTheme(school), [school]);

  const chooseSchool = useCallback((next: School | undefined) => {
    setSchool(next);
    // "none" remembers an explicit "not a student" answer so the pop-up doesn't return.
    write(local, SCHOOL_KEY, next?.id ?? 'none');
    setPickerOpen(false);
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);

  const dismissPicker = useCallback(() => {
    write(session, SKIPPED_KEY, '1');
    setPickerOpen(false);
  }, []);

  const value = useMemo(
    () => ({ school, chooseSchool, pickerOpen, openPicker, dismissPicker }),
    [school, chooseSchool, pickerOpen, openPicker, dismissPicker]
  );

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

const NO_PROVIDER: SchoolContextType = {
  school: undefined,
  chooseSchool: () => {},
  pickerOpen: false,
  openPicker: () => {},
  dismissPicker: () => {},
};

/** Works outside SchoolProvider too (as "no school picked"), so pages render in tests. */
export const useSchool = () => useContext(SchoolContext) ?? NO_PROVIDER;
