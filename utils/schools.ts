import { siteSettings } from '../siteSettings';

export type School = (typeof siteSettings.schools)[number];

export interface Neighborhood {
  name: string;
  streets: string[];
  /** Ids of the schools whose students commonly live here. */
  schools?: string[];
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

export interface NeighborhoodGroups {
  /** Shown right away: the school's student neighborhoods, closest to campus first. */
  nearby: Neighborhood[];
  /** Behind a "more" button: every other neighborhood, closest first, then the catch-all "Other". */
  more: Neighborhood[];
}

/**
 * Splits the neighborhood buttons for a school. With no school, every neighborhood is
 * shown in siteSettings.ts order and nothing is hidden.
 */
export function groupNeighborhoodsForSchool(school: School | undefined): NeighborhoodGroups {
  if (!school) return { nearby: neighborhoods, more: [] };
  const byDistance = (a: Neighborhood, b: Neighborhood) =>
    distanceKm(school.campus, a.center!) - distanceKm(school.campus, b.center!);
  const located = neighborhoods.filter((n) => n.center);
  // Neighborhoods without a center (the catch-all "Other") always go last.
  const unlocated = neighborhoods.filter((n) => !n.center);
  const isForSchool = (n: Neighborhood) => n.schools?.includes(school.id) ?? false;
  const nearby = located.filter(isForSchool).sort(byDistance);
  const others = located.filter((n) => !isForSchool(n)).sort(byDistance);
  // A school with no tagged neighborhoods still gets a closest-first list.
  if (nearby.length === 0) return { nearby: [...others, ...unlocated], more: [] };
  return { nearby, more: [...others, ...unlocated] };
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
