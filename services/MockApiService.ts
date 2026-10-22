import type { IApiService, ReviewUpdate } from './interfaces';
import type { Landlord, Review } from '../types';

// Clearly fake Pittsburgh landlord data for demo/development mode
const MOCK_LANDLORDS: Landlord[] = [
  {
    id: 1,
    name: 'Demo: John Peterson',
    addresses: ['123 Forbes Ave', '125 Forbes Ave'],
    city: 'Pittsburgh',
    status: 'approved',
    is_deleted: false,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Demo: Margaret Sullivan',
    addresses: ['456 Craig St'],
    city: 'Pittsburgh',
    status: 'approved',
    is_deleted: false,
    created_at: '2024-02-03T14:30:00Z',
  },
  {
    id: 3,
    name: 'Demo: Oakland Properties LLC',
    addresses: ['789 Atwood St', '791 Atwood St', '793 Atwood St'],
    city: 'Pittsburgh',
    status: 'approved',
    is_deleted: false,
    created_at: '2024-03-20T09:15:00Z',
  },
  {
    id: 4,
    name: 'Demo: Robert Kaminski',
    addresses: ['22 Semple St'],
    city: 'Pittsburgh',
    status: 'approved',
    is_deleted: false,
    created_at: '2024-04-10T11:45:00Z',
  },
  {
    id: 5,
    name: 'Demo: Shadyside Rentals Inc.',
    addresses: ['310 S Aiken Ave', '312 S Aiken Ave'],
    city: 'Pittsburgh',
    status: 'approved',
    is_deleted: false,
    created_at: '2024-05-01T08:00:00Z',
  },
];

const MOCK_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: 101,
      landlord_id: 1,
      rating: 4,
      communication: 5,
      maintenance: 4,
      respect: 4,
      comment:
        '[DEMO REVIEW] John was generally a great landlord. Very responsive to maintenance requests and always professional. The apartment was well-maintained and he respected our privacy.',
      would_rent_again: true,
      rent_amount: 1200,
      property_address: '123 Forbes Ave, Apt 2B',
      verification_status: 'verified',
      created_by_student: true,
      tags: ['Communicative', 'Timely Maintenance', 'Pet Friendly'],
      is_deleted: false,
      created_at: '2024-06-01T12:00:00Z',
      updated_at: '2024-06-01T12:00:00Z',
    },
    {
      id: 102,
      landlord_id: 1,
      rating: 3,
      communication: 3,
      maintenance: 2,
      respect: 4,
      comment:
        '[DEMO REVIEW] Decent landlord overall. Took a while to fix a leaky faucet (about 2 weeks), but was always polite. Returned security deposit on time.',
      would_rent_again: false,
      rent_amount: 1150,
      property_address: '125 Forbes Ave, Apt 1A',
      verification_status: 'unverified',
      created_by_student: false,
      tags: ['Slow Communication', 'Communicative'],
      is_deleted: false,
      created_at: '2024-07-15T09:30:00Z',
      updated_at: '2024-07-15T09:30:00Z',
    },
  ],
  2: [
    {
      id: 201,
      landlord_id: 2,
      rating: 5,
      communication: 5,
      maintenance: 5,
      respect: 5,
      comment:
        '[DEMO REVIEW] Margaret is an amazing landlord! She fixed every issue within 24 hours, was always respectful, and even left a welcome gift when we moved in.',
      would_rent_again: true,
      rent_amount: 950,
      property_address: '456 Craig St, Apt 3',
      verification_status: 'verified',
      created_by_student: true,
      is_deleted: false,
      created_at: '2024-08-20T15:00:00Z',
      updated_at: '2024-08-20T15:00:00Z',
    },
    {
      id: 202,
      landlord_id: 2,
      rating: 5,
      communication: 4,
      maintenance: 5,
      respect: 5,
      comment:
        '[DEMO REVIEW] One of the best renting experiences I have had. The apartment was clean, repairs were done quickly, and Margaret was always fair.',
      would_rent_again: true,
      rent_amount: 1000,
      property_address: '456 Craig St, Apt 4',
      verification_status: 'verified',
      created_by_student: true,
      is_deleted: false,
      created_at: '2024-09-05T10:00:00Z',
      updated_at: '2024-09-05T10:00:00Z',
    },
  ],
  3: [
    {
      id: 301,
      landlord_id: 3,
      rating: 2,
      communication: 1,
      maintenance: 2,
      respect: 2,
      comment:
        '[DEMO REVIEW] Very hard to get in touch with. Maintenance requests often went unanswered for weeks. The property management company was unresponsive.',
      would_rent_again: false,
      rent_amount: 1400,
      property_address: '789 Atwood St, Unit 5',
      verification_status: 'unverified',
      created_by_student: false,
      is_deleted: false,
      created_at: '2024-05-10T08:00:00Z',
      updated_at: '2024-05-10T08:00:00Z',
    },
    {
      id: 302,
      landlord_id: 3,
      rating: 3,
      communication: 2,
      maintenance: 3,
      respect: 3,
      comment:
        '[DEMO REVIEW] Average experience. Communication could be better but they do fix things eventually. Great location for students.',
      would_rent_again: false,
      rent_amount: 1350,
      property_address: '791 Atwood St, Unit 2',
      verification_status: 'unverified',
      created_by_student: true,
      is_deleted: false,
      created_at: '2024-06-22T14:00:00Z',
      updated_at: '2024-06-22T14:00:00Z',
    },
  ],
  4: [
    {
      id: 401,
      landlord_id: 4,
      rating: 4,
      communication: 4,
      maintenance: 4,
      respect: 5,
      comment:
        '[DEMO REVIEW] Robert is a hands-off landlord which I appreciated. He respected our privacy and fixed things promptly.',
      would_rent_again: true,
      rent_amount: 850,
      property_address: '22 Semple St, Apt 1',
      verification_status: 'verified',
      created_by_student: true,
      is_deleted: false,
      created_at: '2024-10-01T11:00:00Z',
      updated_at: '2024-10-01T11:00:00Z',
    },
  ],
  5: [
    {
      id: 501,
      landlord_id: 5,
      rating: 3,
      communication: 3,
      maintenance: 3,
      respect: 3,
      comment:
        '[DEMO REVIEW] Pretty standard property management experience. Nothing exceptional but nothing terrible either. They keep common areas clean.',
      would_rent_again: true,
      rent_amount: 1600,
      property_address: '310 S Aiken Ave, Apt 2A',
      verification_status: 'unverified',
      created_by_student: false,
      is_deleted: false,
      created_at: '2024-11-15T16:30:00Z',
      updated_at: '2024-11-15T16:30:00Z',
    },
  ],
};

let nextId = 1000;

export class MockApiService implements IApiService {
  async getLandlords(): Promise<Landlord[]> {
    return MOCK_LANDLORDS.filter((landlord) => !landlord.is_deleted);
  }

  async getLandlordById(id: number): Promise<Landlord | undefined> {
    return MOCK_LANDLORDS.find((l) => l.id === id && !l.is_deleted);
  }

  async deleteLandlord(landlordId: number): Promise<boolean> {
    const landlord = MOCK_LANDLORDS.find((l) => l.id === landlordId && !l.is_deleted);
    if (!landlord) throw new Error('Landlord not found.');
    landlord.is_deleted = true;
    return true;
  }

  async getReviewsByLandlordId(landlordId: number, includeDeleted = false): Promise<Review[]> {
    const reviews = MOCK_REVIEWS[landlordId] ?? [];
    return includeDeleted ? [...reviews] : reviews.filter(review => !review.is_deleted);
  }

  async getReviewById(reviewId: number): Promise<Review | undefined> {
    for (const reviews of Object.values(MOCK_REVIEWS)) {
      const found = reviews.find((r) => r.id === reviewId);
      if (found) return { ...found };
    }
    return undefined;
  }

  async getLatestReviewForLandlordByUser(
    _landlordId: number,
    _userId: string
  ): Promise<Review | undefined> {
    return undefined;
  }

  async uploadVerificationFile(_file: File, _userId: string, _reviewId: number): Promise<string> {
    return 'demo/mock-verification-file.pdf';
  }

  async deleteVerificationFile(_filePath: string): Promise<void> {}

  async getVerificationFileUrl(_filePath: string): Promise<string> {
    return '#';
  }

  async addLandlord(
    landlordData: Omit<Landlord, 'id' | 'is_deleted' | 'created_at' | 'status'>
  ): Promise<Landlord> {
    return {
      ...landlordData,
      id: ++nextId,
      status: 'pending',
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
  }

  async addReview(
    reviewData: Omit<Review, 'id' | 'is_deleted' | 'created_at' | 'updated_at' | 'verification_file_url'>
  ): Promise<Review> {
    return {
      ...reviewData,
      id: ++nextId,
      is_deleted: false,
      verification_file_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateReview(_reviewId: number, _data: ReviewUpdate): Promise<void> {}

  async deleteReview(reviewId: number): Promise<boolean> {
    const review = Object.values(MOCK_REVIEWS).flat().find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found.');
    review.is_deleted = true;
    return true;
  }

  async restoreReview(reviewId: number): Promise<boolean> {
    const review = Object.values(MOCK_REVIEWS).flat().find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found.');
    review.is_deleted = false;
    return true;
  }

  async getPendingLandlords(): Promise<Landlord[]> {
    return [];
  }

  async getPendingReviews(): Promise<Review[]> {
    return [];
  }

  async updateLandlordStatus(
    _landlordId: number,
    _status: 'pending' | 'approved' | 'rejected'
  ): Promise<boolean> {
    return true;
  }

  async updateReviewVerificationStatus(
    _reviewId: number,
    _verificationStatus: 'unverified' | 'pending' | 'verified'
  ): Promise<boolean> {
    return true;
  }

  async updateLandlordAddresses(_landlordId: number, _addresses: string[]): Promise<boolean> {
    return true;
  }

  async getAdminStats(): Promise<{ landlordCount: number; reviewCount: number; addressCount: number; userCount: number }> {
    const allReviews = Object.values(MOCK_LANDLORDS).flatMap(() => []);
    return {
      landlordCount: MOCK_LANDLORDS.filter(l => !l.is_deleted && l.status === 'approved').length,
      reviewCount: 12,
      addressCount: 8,
      userCount: -1,
    };
  }
}
