
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServicesContext';
import LandlordCard from '../components/LandlordCard';
import type { Landlord, Review } from '../types';
import BrandLogo from '../components/BrandLogo';
import { siteSettings } from '../siteSettings';

type FocusArea = (typeof siteSettings.schools)[number]['focusAreas'][number];

const MainPage: React.FC = () => {
  const { landlords, loading, deleteLandlord } = useData();
  const { user, isAdmin } = useAuth();
  const { api } = useServices();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFocus, setActiveFocus] = useState<FocusArea | null>(null);
  const [ratings, setRatings] = useState<{ [landlordId: number]: number | null }>({});
  const [reviewsByLandlord, setReviewsByLandlord] = useState<{ [landlordId: number]: Review[] }>({});
  const [deletingLandlordId, setDeletingLandlordId] = useState<number | null>(null);

  useEffect(() => {
    if (landlords.length === 0) return;
    let cancelled = false;
    const fetchData = async () => {
      const entries = await Promise.all(
        landlords.map(async (landlord) => {
          try {
            const reviews = await api.getReviewsByLandlordId(landlord.id);
            const active = reviews.filter((r) => !r.is_deleted);
            const avg = active.length > 0
              ? active.reduce((sum, r) => sum + r.landlord_rating, 0) / active.length
              : null;
            return { id: landlord.id, avg, active };
          } catch {
            return { id: landlord.id, avg: null, active: [] };
          }
        })
      );
      if (!cancelled) {
        setRatings(Object.fromEntries(entries.map(({ id, avg }) => [id, avg])));
        setReviewsByLandlord(Object.fromEntries(entries.map(({ id, active }) => [id, active])));
      }

    };
    fetchData();
    return () => { cancelled = true; };
  }, [landlords, api]);

  const filteredLandlords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const streets = activeFocus?.streets.map(s => s.toLowerCase()) ?? [];
    return landlords.filter(landlord => {
      if (streets.length > 0 && !landlord.addresses?.some(a => streets.some(s => a.toLowerCase().includes(s)))) {
        return false;
      }
      if (!term) return true;
      if (landlord.name.toLowerCase().includes(term)) return true;
      if (landlord.addresses?.some(a => a.toLowerCase().includes(term))) return true;
      const reviews = reviewsByLandlord[landlord.id] ?? [];
      if (reviews.some(r => r.comment?.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [searchTerm, activeFocus, landlords, reviewsByLandlord]);

  const handleAddLandlordClick = () => {
    navigate(user ? '/add-landlord' : '/login');
  };

  const handleDeleteLandlord = async (landlord: Landlord) => {
    if (deletingLandlordId !== null) return;
    if (!window.confirm(`Are you sure you want to delete ${landlord.name}?`)) return;
    setDeletingLandlordId(landlord.id);
    try {
      await deleteLandlord(landlord.id);
    } catch (error) {
      console.error('Failed to delete landlord:', error);
      window.alert('Could not delete this landlord. Please try again.');
    } finally {
      setDeletingLandlordId(null);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero__content">
          <span className="hero__kicker">
            {siteSettings.schools.map(s => s.name).join(' · ')} · {siteSettings.city}
          </span>
          <BrandLogo variant="homepage" className="hero__logo" />
          <p className="hero__subtitle">
            How would your landlord act if everyone was watching?
          </p>

          <div className="hero__search-wrap">
            <div className="hero__search-box">
              <div className="hero__search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by landlord name, address, or review content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hero__search-input"
              />
            </div>

            <div className="hero__add-cta">
              <span className="hero__add-cta-label">Can't find your landlord?</span>
              <button onClick={handleAddLandlordClick} className="hero__add-cta-btn">
                Add them now
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="focus-areas" aria-label="Neighborhoods we're focusing on">
            {siteSettings.schools.filter(school => school.focusAreas.length > 0).map(school => (
              <div key={school.name} className="focus-areas__school">
                <span className="focus-areas__school-name">{school.name}</span>
                {school.focusAreas.map(area => {
                  const isActive = activeFocus?.name === area.name;
                  return (
                    <button
                      key={area.name}
                      type="button"
                      className={`focus-chip${isActive ? ' focus-chip--active' : ''}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveFocus(isActive ? null : area)}
                    >
                      {area.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="section-heading">
          <h2 className="section-heading__title">
            {activeFocus ? activeFocus.name : `${siteSettings.city} landlords`}
          </h2>
          {!loading && (
            <span className="section-heading__meta">
              {filteredLandlords.length} {filteredLandlords.length === 1 ? 'landlord' : 'landlords'}
              {activeFocus && (
                <button type="button" className="section-heading__clear" onClick={() => setActiveFocus(null)}>
                  Show all
                </button>
              )}
            </span>
          )}
        </div>
        {loading ? (
          <div className="spinner-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="landlord-grid">
            {filteredLandlords.length > 0 ? (
              filteredLandlords.map((landlord: Landlord) => (
                <LandlordCard
                  key={landlord.id}
                  landlord={landlord}
                  onDelete={isAdmin ? () => handleDeleteLandlord(landlord) : undefined}
                  deleting={deletingLandlordId === landlord.id}
                  averageRating={ratings[landlord.id] ?? null}
                  reviewCount={(reviewsByLandlord[landlord.id] ?? []).length}
                  wouldRentAgainPct={
                    (reviewsByLandlord[landlord.id] ?? []).length > 0
                      ? ((reviewsByLandlord[landlord.id] ?? []).filter(r => r.would_rent_again).length /
                          (reviewsByLandlord[landlord.id] ?? []).length) * 100
                      : null
                  }
                  avgMaintenance={
                    (reviewsByLandlord[landlord.id] ?? []).length > 0
                      ? (reviewsByLandlord[landlord.id] ?? []).reduce((sum, r) => sum + (Number(r.building_rating) || 0), 0) /
                          (reviewsByLandlord[landlord.id] ?? []).length
                      : null
                  }
                />
              ))
            ) : (
              <div className="landlord-grid__empty">
                <div className="landlord-grid__empty-emoji">🏚️</div>
                <h3 className="landlord-grid__empty-title">No landlords found</h3>
                <p className="landlord-grid__empty-desc">
                  {searchTerm
                    ? `We couldn't find any landlords matching "${searchTerm}"${activeFocus ? ` in ${activeFocus.name}` : ''}`
                    : activeFocus
                      ? `No landlords have been added in ${activeFocus.name} yet.`
                      : 'No landlords have been added yet.'}
                </p>
                <button onClick={handleAddLandlordClick} className="btn btn-primary">
                  Add a New Landlord
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
