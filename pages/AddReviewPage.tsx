import { removeUnitNumber } from '../utils/properties';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Landlord, Review } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewForm from '../components/ReviewForm';
import TurnstileWidget from '../components/TurnstileWidget';
import { useApiService } from '../context/ServicesContext';
import { TurnstileInstance } from '@marsidev/react-turnstile';
import { isStudentEmail } from '../utils/studentVerification';
import { getSemester, semesterLabel, SEMESTER_RULE_EXPLANATION } from '../utils/semester';


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
  const [propertyAddress, setPropertyAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  // The person's review from the current semester (of any landlord), if they already wrote one.
  const [reviewThisSemester, setReviewThisSemester] = useState<Review | null>(null);
  const [reviewedLandlordName, setReviewedLandlordName] = useState('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const landlordId = Number(id);

  useEffect(() => {
    if (landlordId) getLandlord(landlordId).then(data => setLandlord(data || null));
  }, [landlordId, getLandlord]);

  useEffect(() => {
    if (!user?.id || !landlordId) return;
    api.getCurrentSemesterReviewByUser(user.id)
      .then(async existing => {
        setReviewThisSemester(existing ?? null);
        if (existing) {
          const reviewed = existing.landlord_id === landlordId ? undefined : await api.getLandlordById(existing.landlord_id);
          setReviewedLandlordName(reviewed?.name ?? '');
        }
      })
      .catch(error => console.error('Could not check for an earlier review:', error));
  }, [api, user?.id, landlordId]);

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
        property_address: propertyAddress ? removeUnitNumber(propertyAddress) : undefined,
        neighborhood: neighborhood || undefined,
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

  if (reviewThisSemester) {
    return (
      <div className="form-page">
        <div className="semester-notice">
          <h2>You already posted a review this semester</h2>
          <p>
            You reviewed {reviewedLandlordName || landlord.name} in {semesterLabel(getSemester())}. {SEMESTER_RULE_EXPLANATION} If
            your situation changed, edit that review. You can post a new one when the next semester starts.
          </p>
          <div className="semester-notice__actions">
            <Link to={`/landlord/${reviewThisSemester.landlord_id}/review/${reviewThisSemester.id}/edit`} className="btn btn-primary">
              Edit my review
            </Link>
            <Link to={`/landlord/${landlordId}`} className="btn btn-gray-mid">
              Back to {landlord.name}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress}
          neighborhood={neighborhood} setNeighborhood={setNeighborhood}
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
