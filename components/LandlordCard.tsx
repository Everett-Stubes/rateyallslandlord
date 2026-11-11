
import React from 'react';
import type { Landlord } from '../types';
import { Link } from 'react-router-dom';
import { toLetterGrade, gradeColors } from '../utils/grading';
import { formatLandlordAddress, getDisplayLandlordCity } from '../utils/landlordLocation';

interface LandlordCardProps {
  landlord: Landlord;
  // One address per building, including buildings only mentioned in reviews.
  propertyAddresses?: string[];
  // False for visitors who aren't signed-in students: the exact addresses are replaced by a log-in note.
  showAddresses?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  wouldRentAgainPct?: number | null;
  avgMaintenance?: number | null;
  onDelete?: () => void;
  deleting?: boolean;
}

const LandlordCard: React.FC<LandlordCardProps> = ({
  landlord,
  propertyAddresses,
  showAddresses = true,
  averageRating,
  reviewCount,
  wouldRentAgainPct,
  avgMaintenance,
  onDelete,
  deleting = false,
}) => {
  const displayCity = getDisplayLandlordCity(landlord.city);
  const addresses = propertyAddresses ?? (landlord.addresses ?? []).map(formatLandlordAddress).filter(Boolean);
  const displayAddress = [
    ...(showAddresses ? addresses : []),
    ...(displayCity ? [displayCity] : []),
  ].join(' · ');

  return (
    <div className="landlord-card-wrapper">
      <Link to={`/landlord/${landlord.id}`} className="landlord-card-link">
        <div className={`landlord-card${onDelete ? ' landlord-card--deletable' : ''}`}>
        <div className="landlord-card__left review-grade-block">
          <div className="landlord-card__grade" style={averageRating != null ? gradeColors(toLetterGrade(averageRating)) : undefined}>
            {averageRating != null ? toLetterGrade(averageRating) : '🏚️'}
          </div>
          <div className="review-rating-num">
            {reviewCount ?? 0} {reviewCount === 1 ? 'rating' : 'ratings'}
          </div>
        </div>

        <div className="landlord-card__body">
          <div className="landlord-card__header">
            <h3 className="landlord-card__name">{landlord.name}</h3>
            {landlord.status === 'pending' && (
              <span className="landlord-card__pending-badge">NEW</span>
            )}
          </div>

          <div className="landlord-card__stats-row">
            <span className="landlord-card__stat">
              <span className="landlord-card__stat-value">
                {wouldRentAgainPct != null ? `${Math.round(wouldRentAgainPct)}%` : 'N/A'}
              </span>
              <span className="landlord-card__stat-label">would rent again</span>
            </span>
            <span className="landlord-card__stat-divider">|</span>

            <span className="landlord-card__stat">
              <span className="landlord-card__stat-value">
                {avgMaintenance != null ? toLetterGrade(avgMaintenance) : 'N/A'}
              </span>
              <span className="landlord-card__stat-label">building</span>
            </span>

            {addresses.length > 1 && (
              <>
                <span className="landlord-card__stat-divider">|</span>
                <span className="landlord-card__stat">
                  <span className="landlord-card__stat-value">{addresses.length}</span>
                  <span className="landlord-card__stat-label">properties</span>
                </span>
              </>
            )}
          </div>

          {(displayAddress || !showAddresses) && (
            <div className="landlord-card__footer">
              <div className="landlord-card__address">
                <span aria-hidden="true">{showAddresses ? '📍' : '🔒'}</span>
                <span className="landlord-card__address-text">
                  {showAddresses ? displayAddress : [displayAddress, 'Log in to see by address'].filter(Boolean).join(' · ')}
                </span>
              </div>
            </div>
          )}
        </div>
        </div>
      </Link>
      {onDelete && (
        <button
          type="button"
          className="landlord-card__delete review-action-btn review-action-btn--delete"
          aria-label={`Delete ${landlord.name}`}
          disabled={deleting}
          onClick={onDelete}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </div>
  );
};

export default LandlordCard;
