import type { Landlord, Review, ReviewVotes } from '../types';

export type ReviewUpdate = Partial<
  Omit<Review, 'id' | 'landlord_id' | 'is_deleted' | 'created_at' | 'user_id' | 'created_by_student' | 'semester'>
>;

export interface IApiService {
  getLandlords(): Promise<Landlord[]>;
  getLandlordById(id: number): Promise<Landlord | undefined>;
  getReviewsByLandlordId(landlordId: number, includeDeleted?: boolean): Promise<Review[]>;
  getReviewById(reviewId: number): Promise<Review | undefined>;
  getLatestReviewForLandlordByUser(landlordId: number, userId: string): Promise<Review | undefined>;
  /** The person's review from the current semester (any landlord), if they already posted one. */
  getCurrentSemesterReviewByUser(userId: string): Promise<Review | undefined>;
  addLandlord(
    landlordData: Omit<Landlord, 'id' | 'is_deleted' | 'created_at' | 'status'>,
    reviewData?: Omit<Review, 'id' | 'landlord_id' | 'is_deleted' | 'created_at' | 'updated_at'>
  ): Promise<Landlord>;
  addReview(
    reviewData: Omit<Review, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>
  ): Promise<Review>;
  deleteLandlord(landlordId: number): Promise<boolean>;
  updateReview(reviewId: number, data: ReviewUpdate): Promise<void>;
  deleteReview(reviewId: number): Promise<boolean>;
  restoreReview(reviewId: number): Promise<boolean>;
  getPendingLandlords(): Promise<Landlord[]>;
  getPendingReviews(): Promise<Review[]>;
  updateLandlordStatus(landlordId: number, status: 'pending' | 'approved' | 'rejected'): Promise<boolean>;
  updateReviewVerificationStatus(
    reviewId: number,
    verificationStatus: 'unverified' | 'pending' | 'verified'
  ): Promise<boolean>;
  updateLandlordAddresses(landlordId: number, addresses: string[]): Promise<boolean>;
  updateLandlordNeighborhoods(landlordId: number, neighborhoods: string[]): Promise<boolean>;
  getReviewVotes(landlordId: number, userId?: string): Promise<ReviewVotes>;
  /** value 1 = up, -1 = down, 0 = remove the user's vote. */
  setReviewVote(reviewId: number, userId: string, value: 1 | -1 | 0): Promise<void>;
  getAdminStats(): Promise<{ landlordCount: number; reviewCount: number; addressCount: number; userCount: number }>;
}

export interface IAuthService {
  getSession(): Promise<{ id: string; email: string } | null>;
  onAuthStateChange(
    callback: (user: { id: string; email: string } | null) => void
  ): { unsubscribe: () => void };
  signIn(
    email: string,
    password: string,
    captchaToken?: string
  ): Promise<{ success: boolean; user?: { id: string; email: string }; error?: string; emailNotVerified?: boolean }>;
  signUp(
    email: string,
    password: string,
    options: { redirectTo: string; captchaToken?: string; data?: Record<string, unknown> }
  ): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  resetPassword(
    email: string,
    options: { redirectTo: string; captchaToken?: string }
  ): Promise<{ success: boolean; error?: string }>;
  resendVerification(
    email: string,
    options: { redirectTo: string; captchaToken?: string }
  ): Promise<{ success: boolean; error?: string }>;
  updatePassword(password: string): Promise<{ success: boolean; error?: string }>;
  verifyOtp(params: {
    tokenHash: string;
    type: 'recovery' | 'signup' | 'invite' | 'email' | 'email_change';
  }): Promise<{ error?: string }>;
  exchangeCodeForSession(code: string): Promise<{ error?: string }>;
  checkIsAdmin(email: string): Promise<boolean>;
}
