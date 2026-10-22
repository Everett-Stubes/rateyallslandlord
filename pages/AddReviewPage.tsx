import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Landlord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewForm from '../components/ReviewForm';
import TurnstileWidget from '../components/TurnstileWidget';
import { useApiService } from '../context/ServicesContext';
import { TurnstileInstance } from '@marsidev/react-turnstile';
import { isStudentEmail } from '../utils/studentVerification';


const AddReviewPage: React.FC = () => {
  const api = useApiService();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addReview, getLandlord, loading } = useData();
  const { user } = useAuth();

  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [landlord_rating, setRating] = useState(3);
  const [building_rating, setBuildingCondition] = useState(3);
  const [comment, setComment] = useState('');
  const [wouldRentAgain, setWouldRentAgain] = useState(false);
  const [rentAmount, setRentAmount] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const landlordId = Number(id);

  useEffect(() => {
    if (landlordId) getLandlord(landlordId).then(data => setLandlord(data || null));
  }, [landlordId, getLandlord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) { alert('Please complete the security verification.'); return; }
    setUploading(true);
    try {
      const createdByStudent = isStudentEmail(user.email);
      const reviewData = {
        landlord_id: landlordId,
        user_id: user.id,
        landlord_rating: landlord_rating,
        building_rating: building_rating,
        comment,
        would_rent_again: wouldRentAgain,
        rent_amount: rentAmount ? parseFloat(rentAmount) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        property_address: propertyAddress || undefined,
        verification_status: 'pending' as const,
        created_by_student: createdByStudent,
        tags,
      };
      await addReview(reviewData);
      alert('Review submitted successfully!');
      navigate(`/landlord/${landlordId}`);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(`Failed to submit review: ${err?.message || 'Unknown error'}`);
      turnstileRef.current?.reset();
      setTurnstileToken('');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !landlord) return <LoadingSpinner />;

  return (
    <div className="form-page">
      <h1 className="form-page__title">{landlord?.name}</h1>
      <h2 className="form-page__subtitle">Add Review</h2>

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

        <TurnstileWidget
          turnstileRef={turnstileRef}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken('')}
          onError={() => setTurnstileToken('')}
        />

        <p className="form-tos">
          By submitting your review, you agree to our{' '}
          <a href="/terms-and-conditions">Terms and Conditions.</a>
        </p>

        <button
          type="submit"
          disabled={uploading || !turnstileToken}
          className="btn btn-success btn-full btn-lg"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default AddReviewPage;
