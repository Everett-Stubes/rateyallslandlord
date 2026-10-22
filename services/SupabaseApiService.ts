import type { SupabaseClient } from '@supabase/supabase-js';
import type { IApiService, ReviewUpdate } from './interfaces';
import type { Landlord, Review } from '../types';

export class SupabaseApiService implements IApiService {
  constructor(private client: SupabaseClient) {}

  async getLandlords(): Promise<Landlord[]> {
    const { data, error } = await this.client
      .from('landlords')
      .select('*')
      .eq('is_deleted', false)
      // .eq('status', 'approved')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async getLandlordById(id: number): Promise<Landlord | undefined> {
    const { data, error } = await this.client
      .from('landlords')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async deleteLandlord(landlordId: number): Promise<boolean> {
    const { error } = await this.client
      .from('landlords')
      .update({ is_deleted: true })
      .eq('id', landlordId)
      .eq('is_deleted', false)
      .select('id')
      .single();
    if (error) throw error;
    return true;
  }

  async getReviewsByLandlordId(landlordId: number, includeDeleted = false): Promise<Review[]> {
    let query = this.client
      .from('reviews')
      .select('*')
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });

    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getReviewById(reviewId: number): Promise<Review | undefined> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async getLatestReviewForLandlordByUser(
    landlordId: number,
    userId: string
  ): Promise<Review | undefined> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('landlord_id', landlordId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0];
  }

  async addLandlord(
    landlordData: Omit<Landlord, 'id' | 'is_deleted' | 'created_at' | 'status'>,
    reviewData?: Omit<Review, 'id' | 'landlord_id' | 'is_deleted' | 'created_at' | 'updated_at'>
  ): Promise<Landlord> {
    const { data: newLandlord, error: landlordError } = await this.client
      .from('landlords')
      .insert([{ ...landlordData, status: 'pending' }])
      .select()
      .single();

    if (landlordError) throw landlordError;

    if (reviewData && newLandlord) {
      const { error: reviewError } = await this.client
        .from('reviews')
        .insert([{ ...reviewData, landlord_id: newLandlord.id }]);
      if (reviewError) throw reviewError;
    }

    return newLandlord;
  }

  async addReview(
    reviewData: Omit<Review, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>
  ): Promise<Review> {
    const { data, error } = await this.client
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateReview(reviewId: number, data: ReviewUpdate): Promise<void> {
    const { error } = await this.client
      .from('reviews')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', reviewId);
    if (error) throw error;
  }

  async deleteReview(reviewId: number): Promise<boolean> {
    const { error } = await this.client
      .from('reviews')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .eq('is_deleted', false)
      .select('id')
      .single();
    if (error) throw error;
    return true;
  }

  async restoreReview(reviewId: number): Promise<boolean> {
    const { error } = await this.client
      .from('reviews')
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq('id', reviewId);
    if (error) throw error;
    return true;
  }

  async getPendingLandlords(): Promise<Landlord[]> {
    const { data, error } = await this.client
      .from('landlords')
      .select('*')
      .eq('is_deleted', false)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getPendingReviews(): Promise<Review[]> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('is_deleted', false)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async updateLandlordStatus(
    landlordId: number,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<boolean> {
    const { error } = await this.client
      .from('landlords')
      .update({ status })
      .eq('id', landlordId);
    if (error) throw error;
    return true;
  }

  async updateReviewVerificationStatus(
    reviewId: number,
    verificationStatus: 'unverified' | 'pending' | 'verified'
  ): Promise<boolean> {
    const { error } = await this.client
      .from('reviews')
      .update({
        verification_status: verificationStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);
    if (error) throw error;
    return true;
  }

  async updateLandlordAddresses(landlordId: number, addresses: string[]): Promise<boolean> {
    const { error } = await this.client
      .from('landlords')
      .update({ addresses })
      .eq('id', landlordId);
    if (error) throw error;
    return true;
  }

  async getAdminStats(): Promise<{ landlordCount: number; reviewCount: number; addressCount: number; userCount: number }> {
    const [landlordsRes, reviewsRes, addressesRes, usersRes] = await Promise.all([
      this.client.from('landlords').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'approved'),
      this.client.from('reviews').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      this.client.from('reviews').select('property_address').eq('is_deleted', false).not('property_address', 'is', null),
      this.client.from('reviews').select('user_id').eq('is_deleted', false).not('user_id', 'is', null),
    ]);
    const landlordCount = landlordsRes.count ?? 0;
    const reviewCount = reviewsRes.count ?? 0;
    const addressCount = new Set((addressesRes.data || []).map((r: { property_address: string }) => r.property_address?.trim().toLowerCase()).filter(Boolean)).size;
    const userCount = new Set((usersRes.data || []).map((r: { user_id: string }) => r.user_id).filter(Boolean)).size;
    return { landlordCount, reviewCount, addressCount, userCount };
  }

}
