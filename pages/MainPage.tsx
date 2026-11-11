
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../context/ServicesContext';
import LandlordCard from '../components/LandlordCard';
import type { Landlord, Review } from '../types';
import BrandLogo from '../components/BrandLogo';
import { siteSettings } from '../siteSettings';
import { getAllLandlordAddresses, getLandlordProperties } from '../utils/properties';
import { groupNeighborhoodsForSchool, getLandlordNeighborhoodNames, type Neighborhood } from '../utils/schools';
import { useSchool } from '../context/SchoolContext';
import SuggestNeighborhood from '../components/SuggestNeighborhood';

const MainPage: React.FC = () => {
  const { landlords, loading, deleteLandlord } = useData();
  const { isAdmin, canSeeAddresses } = useAuth();
  const { api } = useServices();
  const navigate = useNavigate();
  const { school } = useSchool();
  const neighborhoodGroups = useMemo(() => groupNeighborhoodsForSchool(school), [school]);
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFocus, setActiveFocus] = useState<Neighborhood | null>(null);
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
    return landlords.filter(landlord => {
      const reviews = reviewsByLandlord[landlord.id] ?? [];
      const addresses = getAllLandlordAddresses(landlord, reviews);
      if (activeFocus && !getLandlordNeighborhoodNames(landlord.neighborhoods, addresses, reviews.map(r => r.neighborhood)).has(activeFocus.name)) return false;
      if (!term) return true;
      if (landlord.name.toLowerCase().includes(term)) return true;
      // Searching by address would let anyone confirm an address, so it needs a student log-in.
      if (canSeeAddresses && addresses.some(a => a.toLowerCase().includes(term))) return true;
      if (reviews.some(r => r.comment?.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [searchTerm, activeFocus, landlords, reviewsByLandlord, canSeeAddresses]);

  const focusTitle = activeFocus
    ? activeFocus.streets.length > 0
      ? activeFocus.name
      : `${activeFocus.name} neighborhoods`
    : null;

  // Logged-out visitors are sent to log in first, then brought back to the form.
  const handleAddLandlordClick = () => {
    navigate('/add-landlord');
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
            {school ? `${school.name} · ${siteSettings.city}` : `${siteSettings.city}, ${siteSettings.state}`}
          </span>
          <div className="hero__title-row">
            <h1 className="hero__title-logo">
              <BrandLogo variant="homepage" className="hero__logo" />
            </h1>
            <p className="hero__tagline">{siteSettings.tagline}</p>
          </div>
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
                placeholder={canSeeAddresses ? 'Search by landlord name, address, or review content...' : 'Search by landlord name or review content...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hero__search-input"
              />
            </div>
            {!canSeeAddresses && (
              <p className="addresses-locked-note">
                🔒 <Link to="/login" className="addresses-locked-note__link">Log in</Link> with your school email to see exact addresses and search by address.
              </p>
            )}

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

          <div className="focus-areas" role="group" aria-label="Filter by neighborhood">
            <div className="focus-areas__school">
              <span className="focus-areas__school-name">
                {school ? `Neighborhoods near ${school.shortName}` : 'Neighborhoods'}
              </span>
              {[
                ...neighborhoodGroups.nearby,
                // Keep a selected neighborhood visible even when the extra ones are hidden.
                ...(showAllNeighborhoods
                  ? neighborhoodGroups.more
                  : neighborhoodGroups.more.filter(n => n.name === activeFocus?.name)),
              ].map(neighborhood => {
                const isActive = activeFocus?.name === neighborhood.name;
                return (
                  <button
                    key={neighborhood.name}
                    type="button"
                    className={`focus-chip${isActive ? ' focus-chip--active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveFocus(isActive ? null : neighborhood)}
                  >
                    {neighborhood.name}
                  </button>
                );
              })}
              {neighborhoodGroups.more.length > 0 && (
                <button
                  type="button"
                  className="focus-chip focus-chip--more"
                  aria-expanded={showAllNeighborhoods}
                  onClick={() => setShowAllNeighborhoods(open => !open)}
                >
                  {showAllNeighborhoods ? 'Fewer neighborhoods' : `+ ${neighborhoodGroups.more.length} more`}
                </button>
              )}
            </div>
            <SuggestNeighborhood className="focus-areas__suggest" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="section-heading">
          <h2 className="section-heading__title">
            {focusTitle ?? `${siteSettings.city} landlords`}
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
                  propertyAddresses={getLandlordProperties(landlord, reviewsByLandlord[landlord.id] ?? []).map(p => p.address)}
                  showAddresses={canSeeAddresses}
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
                    ? `We couldn't find any landlords matching "${searchTerm}"${focusTitle ? ` in ${focusTitle}` : ''}`
                    : focusTitle
                      ? `No landlords have been added in ${focusTitle} yet.`
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
