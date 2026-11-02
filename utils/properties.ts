import type { Landlord, Review } from '../types';
import { formatLandlordAddress } from './landlordLocation';

// Matches a trailing unit such as ", Apt 2B", " Unit A", " #12", or ", Suite 300". The unit
// label must contain a digit or be a single letter, so street names like "Room Rd" are kept.
const UNIT_SUFFIX = /(,\s*|\s+)(?:(?:apt|apartment|unit|suite|ste|room|rm|bldg|building)\b\.?|#)\s*#?\s*(?:[\w-]*\d[\w-]*|[a-z])\s*$/i;

/** The building an address belongs to: drops the city, state, ZIP, and any unit number. */
export function toBuildingAddress(address: string): string {
  let result = formatLandlordAddress(address);
  while (UNIT_SUFFIX.test(result)) {
    result = result.replace(UNIT_SUFFIX, '');
  }
  return result.replace(/\s+/g, ' ').replace(/,\s*$/, '').trim();
}

const buildingKey = (address: string) => toBuildingAddress(address).toLowerCase();

export interface Property {
  key: string;
  address: string;
  reviews: Review[];
}

/**
 * One entry per building: the landlord's known addresses plus every address tenants
 * gave in their reviews, so a landlord's other properties appear as soon as they're reviewed.
 */
export function getLandlordProperties(landlord: Landlord, reviews: Review[]): Property[] {
  const properties = new Map<string, Property>();
  const add = (address: string | undefined, review?: Review) => {
    if (!address?.trim()) return;
    const key = buildingKey(address);
    if (!key) return;
    if (!properties.has(key)) {
      properties.set(key, { key, address: toBuildingAddress(address), reviews: [] });
    }
    if (review) properties.get(key)!.reviews.push(review);
  };
  (landlord.addresses ?? []).forEach(address => add(address));
  reviews.forEach(review => add(review.property_address, review));
  return [...properties.values()].sort((a, b) => b.reviews.length - a.reviews.length);
}

/** Every address tied to a landlord, for search and neighborhood filters. */
export function getAllLandlordAddresses(landlord: Landlord, reviews: Review[]): string[] {
  return [
    ...(landlord.addresses ?? []),
    ...reviews.map(r => r.property_address).filter((a): a is string => Boolean(a)),
  ];
}

export function isReviewForProperty(review: Review, propertyKey: string): boolean {
  return Boolean(review.property_address) && buildingKey(review.property_address!) === propertyKey;
}
