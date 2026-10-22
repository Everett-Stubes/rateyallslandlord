import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Landlord, Review } from '../types';
import { useServices } from './ServicesContext';
import { useAuth } from './AuthContext';

interface DataContextType {
  landlords: Landlord[];
  reviews: { [key: number]: Review[] };
  getLandlord: (id: number) => Promise<Landlord | undefined>;
  getReviewsForLandlord: (id: number) => Promise<Review[]>;
  addLandlord: (landlordData: Omit<Landlord, 'id' | 'is_deleted' | 'created_at' | 'status'>, reviewData?: Omit<Review, 'id' | 'landlord_id' | 'is_deleted' | 'created_at' | 'updated_at'>) => Promise<Landlord>;
  addReview: (reviewData: Omit<Review, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>) => Promise<Review>;
  deleteLandlord: (landlordId: number) => Promise<void>;
  deleteReview: (reviewId: number, landlordId: number) => Promise<void>;
  restoreReview: (reviewId: number, landlordId: number) => Promise<void>;
  loading: boolean;
  refreshLandlords: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api } = useServices();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [reviews, setReviews] = useState<{ [key: number]: Review[] }>({});
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading } = useAuth();

  const fetchLandlords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLandlords();
      setLandlords(data);
    } catch (error) {
      console.error('Error fetching landlords:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchLandlords();
  }, [fetchLandlords]);

  const getLandlord = useCallback(async (id: number) => {
    setLoading(true);
    try {
      return await api.getLandlordById(id);
    } catch (error) {
      console.error('Error fetching landlord:', error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getReviewsForLandlord = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const landlordReviews = await api.getReviewsByLandlordId(id, isAdmin);
      // Do not reuse an admin's cached reviews after switching to a non-admin session.
      const visibleReviews = isAdmin ? landlordReviews : landlordReviews.filter(r => !r.is_deleted);
      setReviews(prev => ({ ...prev, [id]: visibleReviews }));
      return visibleReviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [api, isAdmin]);

  const handleAddLandlord = async (
    landlordData: Omit<Landlord, 'id' | 'is_deleted' | 'created_at' | 'status'>,
    reviewData?: Omit<Review, 'id' | 'landlord_id' | 'is_deleted' | 'created_at' | 'updated_at'>
  ) => {
    const newLandlord = await api.addLandlord(landlordData, reviewData);
    fetchLandlords();
    return newLandlord;
  };

  const handleAddReview = async (
    reviewData: Omit<Review, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>
  ) => {
    const newReview = await api.addReview(reviewData);
    setReviews(prev => {
      const next = { ...prev };
      delete next[reviewData.landlord_id];
      return next;
    });
    return newReview;
  };

  const handleDeleteLandlord = async (landlordId: number) => {
    if (!isAdmin) throw new Error('Only admins can delete landlords.');
    const deleted = await api.deleteLandlord(landlordId);
    if (!deleted) throw new Error('Could not delete landlord.');
    setLandlords(prev => prev.filter(landlord => landlord.id !== landlordId));
    setReviews(prev => {
      const next = { ...prev };
      delete next[landlordId];
      return next;
    });
  };

  const handleDeleteReview = async (reviewId: number, landlordId: number) => {
    await api.deleteReview(reviewId);
    setReviews(prev => {
      const next = { ...prev };
      delete next[landlordId];
      return next;
    });
  };

  const handleRestoreReview = async (reviewId: number, landlordId: number) => {
    await api.restoreReview(reviewId);
    setReviews(prev => {
      const next = { ...prev };
      delete next[landlordId];
      return next;
    });
  };

  const value = {
    landlords,
    reviews,
    getLandlord,
    getReviewsForLandlord,
    addLandlord: handleAddLandlord,
    addReview: handleAddReview,
    deleteLandlord: handleDeleteLandlord,
    deleteReview: handleDeleteReview,
    restoreReview: handleRestoreReview,
    loading: loading || authLoading,
    refreshLandlords: fetchLandlords,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
