
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Landlord, Review, ReviewVotes } from '../types';
import ReviewCard from '../components/ReviewCard';
import { useApiService } from '../context/ServicesContext';
import { toLetterGrade, gradeColors } from '../utils/grading';
import { getDisplayLandlordCity } from '../utils/landlordLocation';
import { getAllLandlordAddresses, getLandlordProperties, isReviewForProperty, toBuildingAddress } from '../utils/properties';
import { neighborhoods as allNeighborhoods, getLandlordNeighborhoodNames } from '../utils/schools';
import { AddressAutofill } from '@mapbox/search-js-react';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import { siteSettings } from '../siteSettings';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;


const LandlordPage: React.FC = () => {
  const api = useApiService();
  const { id } = useParams<{ id: string }>();
  const { getLandlord, getReviewsForLandlord, loading } = useData();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | null>(null);
  const [votes, setVotes] = useState<ReviewVotes>({ counts: {}, mine: {} });
  const [isEditingNeighborhoods, setIsEditingNeighborhoods] = useState(false);
  const [draftNeighborhoods, setDraftNeighborhoods] = useState<string[]>([]);

  useEffect(() => {
    const landlordId = Number(id);
    if (landlordId) {
      getLandlord(landlordId).then(data => setLandlord(data || null));
      getReviewsForLandlord(landlordId).then(setReviews);
    }
  }, [id, getLandlord, getReviewsForLandlord, isAdmin]);

  // Vote totals are public; the signed-in person's own votes come with them.
  useEffect(() => {
    const landlordId = Number(id);
    if (!landlordId) return;
    api.getReviewVotes(landlordId, user?.id)
      .then(setVotes)
      .catch(error => console.error('Error loading votes:', error));
  }, [id, api, user?.id]);

  // Clicking your current vote again removes it. Votes never change a landlord's grade.
  const handleVote = async (reviewId: number, value: 1 | -1) => {
    if (!user) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    const before = votes;
    const current = before.mine[reviewId];
    const next: 1 | -1 | 0 = current === value ? 0 : value;
    const counts = { ...before.counts };
    const totals = { ...(counts[reviewId] ?? { up: 0, down: 0 }) };
    if (current === 1) totals.up -= 1;
    if (current === -1) totals.down -= 1;
    if (next === 1) totals.up += 1;
    if (next === -1) totals.down += 1;
    counts[reviewId] = totals;
    const mine = { ...before.mine };
    if (next === 0) delete mine[reviewId];
    else mine[reviewId] = next;
    setVotes({ counts, mine });
    try {
      await api.setReviewVote(reviewId, user.id, next);
    } catch (error) {
      console.error('Error saving vote:', error);
      setVotes(before);
      alert('Could not save your vote. Only accounts with a confirmed school email can vote, and you can\'t vote on your own review.');
    }
  };

  const startEditingNeighborhoods = () => {
    if (!landlord) return;
    setDraftNeighborhoods(landlord.neighborhoods ?? []);
    setIsEditingNeighborhoods(true);
  };

  const saveNeighborhoods = async () => {
    if (!landlord) return;
    setIsSaving(true);
    try {
      await api.updateLandlordNeighborhoods(landlord.id, draftNeighborhoods);
      setLandlord({ ...landlord, neighborhoods: draftNeighborhoods });
      setIsEditingNeighborhoods(false);
    } catch (error) {
      console.error('Error saving neighborhoods:', error);
      alert('Failed to save neighborhoods. Please try again.');
    } finally { setIsSaving(false); }
  };

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

  // Removes every saved address for this building (e.g. both "123 Main St" and "123 Main St, Apt 2").
  const handleRemoveAddress = async (propertyKey: string) => {
    if (!landlord) return;
    setIsSaving(true);
    try {
      const updatedAddresses = (landlord.addresses || []).filter(
        addr => toBuildingAddress(addr).toLowerCase() !== propertyKey
      );
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

  const properties = getLandlordProperties(landlord, activeReviews);
  const savedAddressKeys = new Set((landlord.addresses ?? []).map(a => toBuildingAddress(a).toLowerCase()));
  const selectedProperty = properties.find(p => p.key === selectedPropertyKey) ?? null;
  const shownReviews = selectedProperty
    ? visibleReviews.filter(r => isReviewForProperty(r, selectedProperty.key))
    : visibleReviews;
  const average = (reviews: Review[], pick: (r: Review) => number) =>
    reviews.reduce((sum, r) => sum + (Number(pick(r)) || 0), 0) / reviews.length;

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

              <div className="landlord-neighborhoods">
                {isEditingNeighborhoods ? (
                  <>
                    <div className="neighborhood-picker" role="group" aria-label="Neighborhoods">
                      {allNeighborhoods.map(n => {
                        const active = draftNeighborhoods.includes(n.name);
                        return (
                          <button
                            key={n.name}
                            type="button"
                            className={`neighborhood-chip${active ? ' neighborhood-chip--active' : ''}`}
                            aria-pressed={active}
                            onClick={() => setDraftNeighborhoods(active ? draftNeighborhoods.filter(x => x !== n.name) : [...draftNeighborhoods, n.name])}
                          >
                            {n.name}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={saveNeighborhoods} disabled={isSaving} className="landlord-address-btn landlord-address-btn-add">Save</button>
                    <button onClick={() => setIsEditingNeighborhoods(false)} disabled={isSaving} className="landlord-address-btn landlord-address-btn-done">Cancel</button>
                  </>
                ) : (
                  <>
                    {[...getLandlordNeighborhoodNames(landlord.neighborhoods, getAllLandlordAddresses(landlord, activeReviews))].map(name => (
                      <span key={name} className="landlord-tag">{name}</span>
                    ))}
                    {isAdmin && (
                      <button onClick={startEditingNeighborhoods} className="landlord-address-manage-btn">Edit neighborhoods</button>
                    )}
                  </>
                )}
              </div>

              {properties.length > 0 && (
                <div className="landlord-addresses">
                  <div className="landlord-addresses__label">
                    {properties.length === 1 ? 'Property' : `${properties.length} Properties`}
                  </div>
                  <ul className="property-list">
                    {properties.map(property => {
                      const isSelected = property.key === selectedPropertyKey;
                      const count = property.reviews.length;
                      const landlordGrade = count > 0 ? toLetterGrade(average(property.reviews, r => r.landlord_rating)) : null;
                      const buildingGrade = count > 0 ? toLetterGrade(average(property.reviews, r => r.building_rating)) : null;
                      return (
                        <li key={property.key} className="property-row">
                          <button
                            type="button"
                            className={`property-row__btn${isSelected ? ' property-row__btn--active' : ''}`}
                            aria-pressed={isSelected}
                            disabled={count === 0}
                            title={count > 0 ? 'Show reviews for this property' : 'No reviews for this property yet'}
                            onClick={() => setSelectedPropertyKey(isSelected ? null : property.key)}
                          >
                            <span className="property-row__address">{property.address}</span>
                            <span className="property-row__meta">
                              {landlordGrade && (
                                <span className="property-row__grade" style={gradeColors(landlordGrade)} title="Landlord grade at this property">
                                  {landlordGrade}
                                </span>
                              )}
                              {buildingGrade && (
                                <span className="property-row__building">Building {buildingGrade}</span>
                              )}
                              <span className="property-row__count">
                                {count === 0 ? 'No reviews yet' : `${count} ${count === 1 ? 'review' : 'reviews'}`}
                              </span>
                            </span>
                          </button>
                          {isAdmin && isEditingAddresses && savedAddressKeys.has(property.key) && (
                            <button
                              onClick={() => handleRemoveAddress(property.key)}
                              disabled={isSaving}
                              className="landlord-address-remove"
                              title="Remove address"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
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
                          placeholder={siteSettings.addressExample}
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
            {selectedProperty && (
              <span className="reviews-filter-note">
                at {selectedProperty.address}
                <button type="button" className="section-heading__clear" onClick={() => setSelectedPropertyKey(null)}>
                  Show all
                </button>
              </span>
            )}
          </div>
          {activeReviews.length > 0 && (
            <Link to={`/landlord/${id}/add-review`} className="btn btn-primary">
              Write a Review
            </Link>
          )}
        </div>

        <p className="reviews-verified-note">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Every review here comes from a student who confirmed a school email before posting. Names and emails are never shown.
        </p>

        <div className="reviews-list">
          {shownReviews.length > 0 ? (
            shownReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                votes={{ ...(votes.counts[review.id] ?? { up: 0, down: 0 }), mine: votes.mine[review.id] }}
                onVote={value => handleVote(review.id, value)}
              />
            ))
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
