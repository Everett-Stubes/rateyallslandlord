import { siteSettings } from '../siteSettings';

export type School = (typeof siteSettings.schools)[number];

export interface Neighborhood {
  name: string;
  streets: string[];
  center?: { lat: number; lng: number };
}

export const neighborhoods: Neighborhood[] = siteSettings.neighborhoods;

export const findSchool = (id: string | null | undefined): School | undefined =>
  id ? siteSettings.schools.find((school) => school.id === id) : undefined;

/** Straight-line distance in kilometers between two points (haversine formula). */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Neighborhoods closest to the school's campus first. Neighborhoods without a center
 * (the catch-all "Other") keep their place at the end. With no school, the order is unchanged.
 */
export function sortNeighborhoodsForSchool(school: School | undefined): Neighborhood[] {
  if (!school) return neighborhoods;
  const located = neighborhoods.filter((n) => n.center);
  const unlocated = neighborhoods.filter((n) => !n.center);
  const sorted = [...located].sort(
    (a, b) => distanceKm(school.campus, a.center!) - distanceKm(school.campus, b.center!)
  );
  return [...sorted, ...unlocated];
}

const DEFAULT_THEME_COLOR = '#101222';

/**
 * Recolors the whole site. styles.css turns these three colors into the full palette
 * (see the `:root[data-school]` rule). With no school, the original colors come back.
 */
export function applySchoolTheme(school: School | undefined): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (school) {
    root.dataset.school = school.id;
    root.style.setProperty('--school-bg', school.colors.background);
    root.style.setProperty('--school-text', school.colors.text);
    root.style.setProperty('--school-accent', school.colors.accent);
  } else {
    delete root.dataset.school;
    root.style.removeProperty('--school-bg');
    root.style.removeProperty('--school-text');
    root.style.removeProperty('--school-accent');
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', school?.colors.background ?? DEFAULT_THEME_COLOR);
}
