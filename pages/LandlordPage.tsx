
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Landlord, Review } from '../types';
import ReviewCard from '../components/ReviewCard';
import { useApiService } from '../context/ServicesContext';
import { toLetterGrade } from '../utils/grading';
import { formatLandlordAddress, getDisplayLandlordCity } from '../utils/landlordLocation';
import { AddressAutofill } from '@mapbox/search-js-react';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;


const LandlordPage: React.FC = () => {
  const api = useApiService();
  const { id } = useParams<{ id: string }>();
  const { getLandlord, getReviewsForLandlord, loading } = useData();
  const { isAdmin } = useAuth();
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const landlordId = Number(id);
    if (landlordId) {
      getLandlord(landlordId).then(data => setLandlord(data || null));
      getReviewsForLandlord(landlordId).then(setReviews);
    }
  }, [id, getLandlord, getReviewsForLandlord, isAdmin]);

  const handleAddAddress = async () => {
    if (!landlord) return;
    if (!newAddress.trim()) { alert('Address cannot be empty.'); return; }
    setIsSaving(true);
    try {
      const updatedAddresses = [...(landlord.addresses || []), newAddress.trim()];
      await api.updateLandlordAddresses(landlord.id, updatedAddresses);
      setLandlord({ ...landlord, addresses: updatedAddresses });
      setNewAddress('');
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    } finally { setIsSaving(false); }
  };

  const handleRemoveAddress = async (addressToRemove: string) => {
    if (!landlord) return;
    setIsSaving(true);
    try {
      const updatedAddresses = (landlord.addresses || []).filter(addr => addr !== addressToRemove);
      await api.updateLandlordAddresses(landlord.id, updatedAddresses);
      setLandlord({ ...landlord, addresses: updatedAddresses });
    } catch (error) {
      console.error('Error removing address:', error);
      alert('Failed to remove address. Please try again.');
    } finally { setIsSaving(false); }
  };

 
  const visibleReviews = isAdmin ? reviews : reviews.filter(r => !r.is_deleted);
  const activeReviews = visibleReviews.filter(r => !r.is_deleted);
  const numericAverage = activeReviews.length > 0
    ? activeReviews.reduce((acc, r) => acc + r.landlord_rating, 0) / activeReviews.length
    : null;
  const averageRating = numericAverage != null ? toLetterGrade(numericAverage) : 'N/A';
  const displayCity = landlord ? getDisplayLandlordCity(landlord.city) : undefined;

  if (loading && !landlord) return <LoadingSpinner />;
  if (!landlord) return <div style={{ textAlign: 'center', padding: '2rem' }}>Landlord not found.</div>;

  return (
    <div className="page-container">
      {/* Landlord Header Card */}
      <div className="landlord-header-card">
        <div className="landlord-header-card__body">

          <div className="landlord-header-card__main">
          {/* Rating Hero */}
          <div className="landlord-rating-hero">
            <div className="landlord-rating-hero__value">{averageRating}</div>
            <div className="landlord-rating-hero__label">Landlord Quality Based on {activeReviews.length} {activeReviews.length === 1 ? 'Rating' : 'Ratings'}</div>
          </div>

          {/* Top Section */}
          <div className="landlord-top">
            <div className="landlord-top__info">
              <div className="landlord-title-row">
                <h1 className="landlord-title">{landlord.name}</h1>
                {landlord.status === 'pending' && (
                  <span className="badge badge-yellow">NEW</span>
                )}
                {landlord.status === 'rejected' && (
                  <span className="badge badge-red">Rejected</span>
                )}
              </div>

              {displayCity && (
                <div className="landlord-location">
                  📍
                  <span>{displayCity}</span>
                </div>
              )}

              {landlord.addresses && landlord.addresses.length > 0 && (
                <div className="landlord-addresses">
                  <div className="landlord-addresses__label">Known Addresses</div>
                  {landlord.addresses.map((address, index) => (
                    <div key={index} className="landlord-address-row">
                      <span style={{ fontSize: '0.875rem' }}>{formatLandlordAddress(address)}</span>
                      {isAdmin && isEditingAddresses && (
                        <button
                          onClick={() => handleRemoveAddress(address)}
                          disabled={isSaving}
                          className="landlord-address-remove"
                          title="Remove address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="landlord-address-add">
                  {!isEditingAddresses ? (
                    <button onClick={() => setIsEditingAddresses(true)} className="landlord-address-manage-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Manage Addresses
                    </button>
                  ) : (
                    <div className="landlord-address-form">
                      <AddressAutofill
                        accessToken={MAPBOX_TOKEN}
                        options={{ country: 'US', language: 'en' }}
                        onRetrieve={(res: AddressAutofillRetrieveResponse) => {
                          const f = res.features[0];
                          if (!f) return;
                          const p = f.properties;
                          const full = [p.address_line1, p.place, p.region, p.postcode]
                            .filter(Boolean).join(', ');
                          // Defer so this fires after AddressAutofill's native DOM update
                          // (which triggers onChange with just address_line1)
                          setTimeout(() => setNewAddress(full), 0);
                        }}
                      >
                        <input
                          type="text"
                          id="newAddress"
                          value={newAddress}
                          onChange={e => setNewAddress(e.target.value)}
                          placeholder="e.g., 123 Main St, Pittsburgh, PA"
                          className="form-input"
                          autoComplete="street-address"
                          required
                        />
                      </AddressAutofill>
                      <button
                        onClick={handleAddAddress}
                        disabled={!newAddress.trim() || isSaving}
                        className="landlord-address-btn landlord-address-btn-add"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setIsEditingAddresses(false); setNewAddress(''); }}
                        disabled={isSaving}
                        className="landlord-address-btn landlord-address-btn-done"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Commonly Mentioned Tags */}
          {(() => {
            const tagCounts: Record<string, number> = {};
            activeReviews.forEach(r => (r.tags ?? []).forEach(t => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
            const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
            if (topTags.length === 0) return null;
            return (
              <div className="landlord-common-tags">
                <h3 className="landlord-common-tags__title">Commonly Mentioned</h3>
                <div className="landlord-tag-list">
                  {topTags.map(([tag, count]) => (
                    <span key={tag} className="landlord-tag">
                      #{tag.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          </div>

          {/* Stats Grid */}
          <div className="landlord-stats-grid">
            {/* Quick Stats */}
            <div>
              <div className="quick-stats-grid">
                <div className="quick-stat-box">
                  <div className="quick-stat-value">
                    {activeReviews.length > 0
                      ? toLetterGrade(activeReviews.reduce((acc, r) => acc + (Number(r.building_rating) || 0), 0) / activeReviews.length)
                      : 'N/A'}
                  </div>
                  <div className="quick-stat-label">Building Condition</div>
                </div>
                <div className="quick-stat-box">
                  <div className="quick-stat-value">
                    {activeReviews.length > 0
                      ? `${Math.round((activeReviews.filter(r => r.would_rent_again).length / activeReviews.length) * 100)}%`
                      : 'N/A'}
                  </div>
                  <div className="quick-stat-label">Would Rent Again</div>
                </div>
                <div className="quick-stat-box">
                  <div className="quick-stat-value">
                    {activeReviews.filter(r => r.rent_amount).length > 0
                      ? `$${Math.round(activeReviews.reduce((acc, r) => acc + (r.rent_amount || 0), 0) / activeReviews.filter(r => r.rent_amount).length)}`
                      : 'N/A'}
                  </div>
                  <div className="quick-stat-label">Avg Rent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <div className="reviews-header">
          <div className="reviews-title-row">
            <h2 className="reviews-title">Reviews</h2>
            <span className="reviews-count-badge">{activeReviews.length}</span>
            {isAdmin && reviews.length > activeReviews.length && (
              <span className="reviews-hidden-badge">{reviews.length - activeReviews.length} hidden</span>
            )}
          </div>
          {activeReviews.length > 0 && (
            <Link to={`/landlord/${id}/add-review`} className="btn btn-primary">
              Write a Review
            </Link>
          )}
        </div>

        <div className="reviews-list">
          {visibleReviews.length > 0 ? (
            visibleReviews.map(review => <ReviewCard key={review.id} review={review} />)
          ) : (
            <div className="reviews-empty">
              <div className="reviews-empty-icon">
                🏚️
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>No reviews yet</h3>
              <p style={{ color: 'var(--neutral-400)', marginBottom: '1.5rem' }}>Be the first to share your experience with this landlord.</p>
              <Link to={`/landlord/${id}/add-review`} className="btn btn-primary">
                Write a Review
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordPage;
