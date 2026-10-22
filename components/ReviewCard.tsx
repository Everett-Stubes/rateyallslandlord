
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { toLetterGrade, gradeColors } from '../utils/grading';

interface ReviewCardProps {
  review: Review;
  onApprove?: () => void;
  onReject?: () => void;
}


const ReviewCard: React.FC<ReviewCardProps> = ({ review, onApprove, onReject }) => {
  const { isAdmin, user } = useAuth();
  const { deleteReview, restoreReview } = useData();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(review.id, review.landlord_id);
    }
  };

  const handleRestore = async () => {
    if (window.confirm('Are you sure you want to restore this review?')) {
      await restoreReview(review.id, review.landlord_id);
    }
  };

  const handleEdit = () => {
    navigate(`/landlord/${review.landlord_id}/review/${review.id}/edit`);
  };

  const isOwnReview = user && review.user_id === user.id;

  return (
    <div className={`review-card${review.is_deleted ? ' review-card--deleted' : ''}`}>
      {review.is_deleted && isAdmin && (
        <div className="review-deleted-banner">
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Deleted Review (Admin View)
        </div>
      )}

      <div className="review-card__topbar">
        <span className="review-card__address">
          {review.property_address || '—'}
        </span>
        <div className="review-card__date-row">
          <span className="review-card__date">{new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
          {isOwnReview && <span className="review-you-badge">You</span>}
        </div>
      </div>

      <div className="review-card__grades">
        <div className="review-grade-block">
          <span className="review-rating-num">Landlord</span>
          <span className="review-grade-box" style={gradeColors(toLetterGrade(review.landlord_rating))}>{review.landlord_rating.toFixed(1)}</span>
        </div>
        <div className="review-grade-block">
          <span className="review-rating-num">Building</span>
          <span className="review-grade-box" style={gradeColors(toLetterGrade(review.building_rating))}>{review.building_rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="review-card__main">
        {/* <div className="review-card__badges">
          {review.created_by_student && (
            <div className="tooltip-wrap">
              <span className="badge badge-blue" style={{ cursor: 'help' }}>
                <svg style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Verified Student
              </span>
              <div className="tooltip-box">This reviewer used a student email address.</div>
            </div>
          )}

          {review.verification_status === 'verified' ? (
            <span className="badge badge-green">
              <svg style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified Tenant
            </span>
          ) : review.verification_status === 'pending' ? (
            <span className="badge badge-blue">
              <svg className="animate-spin" style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verification Pending
            </span>
          ) : (
            <div className="tooltip-wrap">
              <span className="badge badge-gray" style={{ cursor: 'help' }}>Review Unverified</span>
              <div className="tooltip-box">This review has not been verified and was most likely left anonymously.</div>
            </div>
          )}
        </div> */}

      <div className="review-card__foot">
        <div className="review-foot-item">
          <span className="review-foot-label">Would rent again:</span>
          {review.would_rent_again ? (
            <span className="review-foot-yes">
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Yes
            </span>
          ) : (
            <span className="review-foot-no">
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              No
            </span>
          )}
        </div>
        {review.rent_amount && (
          <div className="review-foot-item">
            <span className="review-foot-label">Rent:</span>
            <span>${review.rent_amount.toFixed(2)}/mo</span>
          </div>
        )}
        {review.bedrooms != null && (
          <div className="review-foot-item">
            <span className="review-foot-label">Bedrooms:</span>
            <span>{review.bedrooms}</span>
          </div>
        )}
      </div>

      <p className="review-comment">{review.comment}</p>

      {review.tags && review.tags.length > 0 && (
        <div className="review-tags-row">
          {review.tags.map(tag => (
            <span key={tag} className="review-tag">#{tag.toLowerCase()}</span>
          ))}
        </div>
      )}

      {(isOwnReview || isAdmin) && (
        <div className="review-card__actions">
            {isOwnReview && !review.is_deleted && (
              <button onClick={handleEdit} className="review-action-btn review-action-btn--edit">Edit</button>
            )}
            {onApprove && onReject ? (
              <>
                <button onClick={onReject} className="admin-btn admin-btn-reject">Reject</button>
                <button onClick={onApprove} className="admin-btn admin-btn-approve">Approve</button>
              </>
            ) : isAdmin && (
              review.is_deleted ? (
                <button onClick={handleRestore} className="review-action-btn review-action-btn--restore">Restore</button>
              ) : (
                <button onClick={handleDelete} className="review-action-btn review-action-btn--delete">Delete</button>
              )
            )}
        </div>
      )}
      </div>
    </div>
  );
};

export default ReviewCard;
