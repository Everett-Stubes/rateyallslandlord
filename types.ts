
export interface Review {
  id: number;
  landlord_id: number;
  user_id?: string; // Changed to UUID string from Supabase Auth
  landlord_rating: number;
  building_rating: number;
  comment: string;
  would_rent_again: boolean;
  rent_amount?: number;
  bedrooms?: number;
  property_address?: string;
  verification_status: 'unverified' | 'pending' | 'verified';
  created_by_student: boolean; // True if user email matches a school domain in siteSettings.ts
  semester?: string; // e.g. '2026-fall'; set by the database when the review is posted
  tags?: string[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Landlord {
  id: number;
  name: string;
  addresses?: string[]; // Changed to array to match database
  neighborhoods?: string[]; // Names from siteSettings.ts, picked when the landlord was added
  city: string;
  status?: 'pending' | 'approved' | 'rejected'; // Added to match database
  is_deleted: boolean; // Changed to snake_case to match database
  created_at?: string; // Added to match database
}

export interface User {
  id: string; // UUID from Supabase Auth
  email: string;
}


/** Up/down vote totals per review id, plus the signed-in user's own votes (1 = up, -1 = down). */
export interface ReviewVotes {
  counts: Record<number, { up: number; down: number }>;
  mine: Record<number, 1 | -1>;
}
