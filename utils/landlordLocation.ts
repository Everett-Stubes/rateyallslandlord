const DEFAULT_LANDLORD_CITY = 'college park';

export function getDisplayLandlordCity(city: string): string | undefined {
  const trimmedCity = city.trim();
  return trimmedCity && trimmedCity.toLowerCase() !== DEFAULT_LANDLORD_CITY
    ? trimmedCity
    : undefined;
}

export function formatLandlordAddress(address: string): string {
  return address.replace(/,\s*College Park\b.*$/i, '').trim();
}
