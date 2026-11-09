// Reviews are limited to one per person, per landlord, per semester. The database decides
// the semester (public.semester_of in init.sql); this file mirrors it for the website.
// Semesters use Atlanta time: spring = Jan-Apr, summer = May-Jul, fall = Aug-Dec.

export type SemesterName = 'spring' | 'summer' | 'fall';

const ATLANTA_TIME = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric' });

/** The semester a moment falls in, like '2026-fall'. */
export function getSemester(date: Date | string = new Date()): string {
  const parts = ATLANTA_TIME.formatToParts(new Date(date));
  const year = parts.find(p => p.type === 'year')!.value;
  const month = Number(parts.find(p => p.type === 'month')!.value);
  const name: SemesterName = month <= 4 ? 'spring' : month <= 7 ? 'summer' : 'fall';
  return `${year}-${name}`;
}

/** '2026-fall' becomes 'Fall 2026'. */
export function semesterLabel(semester: string): string {
  const [year, name] = semester.split('-');
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

export const SEMESTER_RULE_EXPLANATION =
  'We allow one review per landlord each semester (spring, summer, and fall) so no single person can swing a landlord\'s grade. You can edit your review any time.';
