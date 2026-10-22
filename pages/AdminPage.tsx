import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Landlord, Review } from '../types';
import { useApiService } from '../context/ServicesContext';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ReviewCard from '../components/ReviewCard';
import { gradeColors, toLetterGrade } from '../utils/grading';

const AdminPage: React.FC = () => {
  const api = useApiService();
  const { landlords, deleteReview } = useData();
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingLandlords, setPendingLandlords] = useState<Landlord[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [attachedReviewsMap, setAttachedReviewsMap] = useState<Record<number, Review>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'landlords' | 'reviews'>('landlords');
  const [stats, setStats] = useState<{ landlordCount: number; reviewCount: number; addressCount: number; userCount: number } | null>(null);

  // TEMP: auth bypass for preview
  // useEffect(() => {
  //   if (!authLoading && !isAdmin) navigate('/');
  // }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingItems();
      api.getAdminStats().then(setStats).catch(console.error);
    }
  }, [isAdmin]);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const [fetchedLandlords, reviews] = await Promise.all([api.getPendingLandlords(), api.getPendingReviews()]);
      setPendingLandlords(fetchedLandlords);
      setPendingReviews(reviews);

      // Fetch the first review for each pending landlord independently of verification_status
      if (fetchedLandlords.length > 0) {
        const reviewLists = await Promise.all(fetchedLandlords.map(l => api.getReviewsByLandlordId(l.id)));
        const map: Record<number, Review> = {};
        fetchedLandlords.forEach((l, i) => {
          const first = reviewLists[i][0];
          if (first) map[l.id] = first;
        });
        setAttachedReviewsMap(map);
      }
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally { setLoading(false); }
  };

  const handleApproveLandlord = async (id: number) => {
    if (!window.confirm('Are you sure you want to approve this landlord?')) return;
    try { await api.updateLandlordStatus(id, 'approved'); await fetchPendingItems(); }
    catch (error) { alert(`Failed to approve landlord: ${error && error.message ? error.message : String(error)}`); }
  };

  const handleRejectLandlord = async (id: number) => {
    if (!window.confirm('Are you sure you want to reject this landlord?')) return;
    try { await api.updateLandlordStatus(id, 'rejected'); await fetchPendingItems(); }
    catch (error) { alert(`Failed to reject landlord: ${error instanceof Error ? error.message : String(error)}`); }
  };

  const handleApproveReview = async (id: number) => {
    if (!window.confirm('Are you sure you want to approve this review?')) return;
    try { await api.updateReviewVerificationStatus(id, 'verified'); await fetchPendingItems(); alert('Review approved.'); }
    catch (error) { alert(`Failed to approve review: ${error?.message || 'Unknown error'}`); }
  };

  const handleRejectReview = async (review: Review) => {
    if (!window.confirm('Are you sure you want to reject this review?')) return;
    try { await deleteReview(review.id, review.landlord_id); await fetchPendingItems(); alert('Review rejected.'); }
    catch (error) { alert(`Failed to reject review: ${error?.message || 'Unknown error'}`); }
  };

  // TEMP: if (authLoading || !isAdmin) return null;

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Portal</h1>

      <div className="admin-stats-grid">
        {[
          { label: 'Total Landlords', value: stats?.landlordCount },
          { label: 'Total Reviews', value: stats?.reviewCount },
          { label: 'Addresses Reviewed', value: stats?.addressCount },
          { label: 'Active Users', value: stats?.userCount === -1 ? null : stats?.userCount },
        ].map(({ label, value }) => (
          <div key={label} className="admin-stat-card">
            <span className="admin-stat-card__value">
              {value == null ? '—' : value.toLocaleString()}
            </span>
            <span className="admin-stat-card__label">{label}</span>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        <nav className="admin-tabs__nav">
          <button onClick={() => setActiveTab('landlords')} className={`admin-tab${activeTab === 'landlords' ? ' admin-tab--active' : ''}`}>
            Pending Landlords ({pendingLandlords.length})
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`admin-tab${activeTab === 'reviews' ? ' admin-tab--active' : ''}`}>
            Pending Reviews ({pendingReviews.filter(r => !pendingLandlords.some(l => l.id === r.landlord_id)).length})
          </button>
        </nav>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeTab === 'landlords' && (
            <div className="admin-items">
              {pendingLandlords.length === 0 ? (
                <p className="admin-empty">No pending landlords</p>
              ) : (
                pendingLandlords.map((landlord) => {
                  const attachedReview = attachedReviewsMap[landlord.id];
                  return (
                    <div key={landlord.id} className="admin-item">
                      <div className="admin-item__inner">
                        <div className="admin-item__info">
                          <h3 className="admin-item__name">{landlord.name}</h3>
                          <p className="admin-item__detail"><strong>City:</strong> {landlord.city}</p>
                          {landlord.addresses && landlord.addresses.length > 0 && (
                            <p className="admin-item__detail"><strong>Addresses:</strong> {landlord.addresses.join(', ')}</p>
                          )}
                          <p className="admin-item__date">Submitted: {new Date(landlord.created_at || '').toLocaleDateString()}</p>
                        </div>
                        <div className="admin-item__actions">
                          <button onClick={() => handleApproveLandlord(landlord.id)} className="admin-btn admin-btn-approve">Approve</button>
                          <button onClick={() => handleRejectLandlord(landlord.id)} className="admin-btn admin-btn-reject">Reject</button>
                        </div>
                      </div>
                      {attachedReview && (
                        <div className="admin-attached-review">
                          <p className="admin-attached-review__label">Attached Review</p>
                          <div className="admin-item__inner">
                            <div className="admin-item__info">
                              <div className="review-card__grades">
                                <div className="review-grade-block">
                                  <span className="review-rating-num">Landlord Quality</span>
                                  <span
                                    className="review-grade-box"
                                    style={gradeColors(toLetterGrade(attachedReview.landlord_rating))}
                                  >
                                    {toLetterGrade(attachedReview.landlord_rating)}
                                  </span>
                                </div>
                                <div className="review-grade-block">
                                  <span className="review-rating-num">Building Condition</span>
                                  <span
                                    className="review-grade-box"
                                    style={gradeColors(toLetterGrade(attachedReview.building_rating))}
                                  >
                                    {toLetterGrade(attachedReview.building_rating)}
                                  </span>
                                </div>
                              </div>
                              <div className="review-card__main">
                                <div className="review-card__foot">
                                  {attachedReview.property_address && (
                                    <div className="review-foot-item">
                                      <span className="review-foot-label">Address:</span>
                                      <span>{attachedReview.property_address}</span>
                                    </div>
                                  )}
                                  {attachedReview.rent_amount && (
                                    <div className="review-foot-item">
                                      <span className="review-foot-label">Rent:</span>
                                      <span>${attachedReview.rent_amount.toFixed(2)}/mo</span>
                                    </div>
                                  )}
                                  {attachedReview.bedrooms != null && (
                                    <div className="review-foot-item">
                                      <span className="review-foot-label">Bedrooms:</span>
                                      <span>{attachedReview.bedrooms}</span>
                                    </div>
                                  )}
                                  <div className="review-foot-item">
                                    <span className="review-foot-label">Would rent again:</span>
                                    <span>{attachedReview.would_rent_again ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                                <p className="review-comment">{attachedReview.comment}</p>
                                {attachedReview.tags && attachedReview.tags.length > 0 && (
                                  <div className="review-tags-row">
                                    {attachedReview.tags.map(tag => (
                                      <span key={tag} className="review-tag">#{tag.toLowerCase()}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="admin-item__actions">
                              <button onClick={() => handleApproveReview(attachedReview.id)} className="admin-btn admin-btn-approve">Approve</button>
                              <button onClick={() => handleRejectReview(attachedReview)} className="admin-btn admin-btn-reject">Reject</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="admin-items">
              {pendingReviews.filter(r => !pendingLandlords.some(l => l.id === r.landlord_id)).length === 0 ? (
                <p className="admin-empty">No pending reviews</p>
              ) : (
                pendingReviews.filter(r => !pendingLandlords.some(l => l.id === r.landlord_id)).map((review) => {
                  const landlordName = landlords.find(l => l.id === review.landlord_id)?.name;
                  return (
                    <div key={review.id} className="admin-pending-review">
                      {landlordName && (
                        <h3 className="admin-item__name admin-pending-review__landlord">{landlordName}</h3>
                      )}
                      <ReviewCard
                        review={review}
                        onApprove={() => handleApproveReview(review.id)}
                        onReject={() => handleRejectReview(review)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
