import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Review } from '../types';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApiService } from '../context/ServicesContext';

const EditReviewPage: React.FC = () => {
  const api = useApiService();
  const { id, reviewId } = useParams<{ id: string; reviewId: string }>();
  const navigate = useNavigate();
  const { getLandlord, loading } = useData();
  const { user, loading: authLoading } = useAuth();

  const [review, setReview] = useState<Review | null>(null);
  const [landlordName, setLandlordName] = useState('');
  const [landlord_rating, setRating] = useState(3);
  const [building_rating, setBuildingCondition] = useState(3);
  const [comment, setComment] = useState('');
  const [wouldRentAgain, setWouldRentAgain] = useState(false);
  const [rentAmount, setRentAmount] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const landlordId = Number(id);
  const reviewIdNum = Number(reviewId);

  useEffect(() => {
    if (authLoading) return;
    const fetchReviewAndLandlord = async () => {
      const reviewData = await api.getReviewById(reviewIdNum);
      if (!reviewData) {
        alert('Unable to load review. It may have been deleted or you may not have permission to view it.');
        navigate(`/landlord/${landlordId}`);
        return;
      }
      if (!user || reviewData.user_id !== user.id) {
        alert('You can only edit your own reviews');
        navigate(`/landlord/${landlordId}`);
        return;
      }
      setReview(reviewData);
      setRating(reviewData.landlord_rating);
      setBuildingCondition(reviewData.building_rating);
      setComment(reviewData.comment);
      setWouldRentAgain(reviewData.would_rent_again);
      setRentAmount(reviewData.rent_amount ? reviewData.rent_amount.toString() : '');
      setBedrooms(reviewData.bedrooms != null ? reviewData.bedrooms.toString() : '');
      setPropertyAddress(reviewData.property_address || '');
      setTags(reviewData.tags ?? []);
      const landlord = await getLandlord(landlordId);
      if (landlord) setLandlordName(landlord.name);
    };
    fetchReviewAndLandlord();
  }, [reviewIdNum, landlordId, user, authLoading, navigate, getLandlord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('You must be logged in to edit a review'); return; }
    setUploading(true);
    try {
      await api.updateReview(reviewIdNum, {
        landlord_rating, building_rating, comment,
        would_rent_again: wouldRentAgain,
        rent_amount: rentAmount ? parseFloat(rentAmount) : null,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        property_address: propertyAddress || null,
        verification_status: review?.verification_status || 'unverified',
        tags,
      });
      alert('Review updated successfully!');
      navigate(`/landlord/${landlordId}`);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update review:', err);
      alert(`Failed to update review: ${err?.message || String(err) || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !review) return <LoadingSpinner />;

  return (
    <div className="form-page">
      <h1 className="form-page__title">Edit Review For</h1>
      <h2 className="form-page__subtitle">{landlordName}</h2>

      <form onSubmit={handleSubmit} className="form-page__form">
        <ReviewForm
          landlord_rating={landlord_rating} setRating={setRating}
          building_rating={building_rating} setBuildingCondition={setBuildingCondition}
          comment={comment} setComment={setComment}
          wouldRentAgain={wouldRentAgain} setWouldRentAgain={setWouldRentAgain}
          rentAmount={rentAmount} setRentAmount={setRentAmount}
          bedrooms={bedrooms} setBedrooms={setBedrooms}
          propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress}
          tags={tags} setTags={setTags}
        />

        <div className="form-btn-row">
          <button
            type="button"
            onClick={() => navigate(`/landlord/${landlordId}`)}
            className="btn btn-gray-mid"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            {uploading ? 'Updating...' : 'Update Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReviewPage;
