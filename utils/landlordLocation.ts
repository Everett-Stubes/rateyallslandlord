import { siteSettings } from '../siteSettings';

const DEFAULT_LANDLORD_CITY = siteSettings.city.toLowerCase();
// Matches ", Atlanta" (or the configured city) and everything after it, e.g. ", Atlanta, GA 30318".
const DEFAULT_CITY_SUFFIX = new RegExp(
  `,\\s*${siteSettings.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b.*$`,
  'i'
);

export function getDisplayLandlordCity(city: string): string | undefined {
  const trimmedCity = city.trim();
  return trimmedCity && trimmedCity.toLowerCase() !== DEFAULT_LANDLORD_CITY
    ? trimmedCity
    : undefined;
}

export function formatLandlordAddress(address: string): string {
  return address.replace(DEFAULT_CITY_SUFFIX, '').trim();
}
