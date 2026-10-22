import { vi } from 'vitest';
import type { IApiService, IAuthService } from '../../services/interfaces';
import type { Landlord, Review } from '../../types';

export const TEST_USER = { id: 'user-123', email: 'test@pitt.edu' };
export const TEST_ADMIN = { id: 'admin-456', email: 'admin@example.com' };

export const TEST_LANDLORD: Landlord = {
  id: 1,
  name: 'Test Landlord',
  addresses: ['123 Test St'],
  city: 'Pittsburgh',
  status: 'approved',
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z',
};

export const TEST_REVIEW: Review = {
  id: 10,
  landlord_id: 1,
  user_id: 'user-123',
  rating: 4,
  communication: 4,
  maintenance: 4,
  respect: 4,
  comment: 'Great landlord overall.',
  would_rent_again: true,
  rent_amount: 1200,
  property_address: '123 Test St',
  verification_status: 'verified',
  created_by_student: true,
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export function createMockAuthService(overrides?: Partial<IAuthService>): IAuthService {
  return {
    getSession: vi.fn().mockResolvedValue(null),
    onAuthStateChange: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    signIn: vi.fn().mockResolvedValue({ success: false, error: 'Invalid credentials' }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
    signOut: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue({ success: true }),
    updatePassword: vi.fn().mockResolvedValue({ success: true }),
    verifyOtp: vi.fn().mockResolvedValue({ error: undefined }),
    checkIsAdmin: vi.fn().mockResolvedValue(false),
    ...overrides,
  };
}

export function createMockApiService(overrides?: Partial<IApiService>): IApiService {
  return {
    getLandlords: vi.fn().mockResolvedValue([]),
    getLandlordById: vi.fn().mockResolvedValue(undefined),
    getReviewsByLandlordId: vi.fn().mockResolvedValue([]),
    getReviewById: vi.fn().mockResolvedValue(undefined),
    getLatestReviewForLandlordByUser: vi.fn().mockResolvedValue(undefined),
    uploadVerificationFile: vi.fn().mockResolvedValue('file-path'),
    deleteVerificationFile: vi.fn().mockResolvedValue(undefined),
    getVerificationFileUrl: vi.fn().mockResolvedValue('https://example.com/file'),
    addLandlord: vi.fn().mockResolvedValue({ ...TEST_LANDLORD, id: 999 }),
    addReview: vi.fn().mockResolvedValue(TEST_REVIEW),
    deleteLandlord: vi.fn().mockResolvedValue(true),
    updateReview: vi.fn().mockResolvedValue(undefined),
    deleteReview: vi.fn().mockResolvedValue(true),
    restoreReview: vi.fn().mockResolvedValue(true),
    getPendingLandlords: vi.fn().mockResolvedValue([]),
    getPendingReviews: vi.fn().mockResolvedValue([]),
    updateLandlordStatus: vi.fn().mockResolvedValue(true),
    updateReviewVerificationStatus: vi.fn().mockResolvedValue(true),
    updateLandlordAddresses: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createLoggedInAuth(user = TEST_USER): IAuthService {
  return createMockAuthService({
    getSession: vi.fn().mockResolvedValue(user),
    checkIsAdmin: vi.fn().mockResolvedValue(false),
  });
}

export function createAdminAuth(user = TEST_ADMIN): IAuthService {
  return createMockAuthService({
    getSession: vi.fn().mockResolvedValue(user),
    checkIsAdmin: vi.fn().mockResolvedValue(true),
  });
}
