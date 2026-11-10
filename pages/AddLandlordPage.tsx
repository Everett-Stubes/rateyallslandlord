import { removeUnitNumber } from '../utils/properties';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import TurnstileWidget from '../components/TurnstileWidget';
import { useApiService } from '../context/ServicesContext';
import { TurnstileInstance } from '@marsidev/react-turnstile';
import { AddressAutofill } from '@mapbox/search-js-react';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import { siteSettings } from '../siteSettings';
import { isStudentEmail } from '../utils/studentVerification';
import { neighborhoods as allNeighborhoods, inferNeighborhoodNames } from '../utils/schools';
import { getSemester, semesterLabel, SEMESTER_RULE_EXPLANATION } from '../utils/semester';
import SuggestNeighborhood from '../components/SuggestNeighborhood';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

const AddLandlordPage: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addReview, setAddReview] = useState(false);
  const [landlord_rating, setRating] = useState(3);
  const [building_rating, setBuildingCondition] = useState(3);
  const [comment, setComment] = useState('');
  const [wouldRentAgain, setWouldRentAgain] = useState(false);
  const [rentAmount, setRentAmount] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [reviewNeighborhood, setReviewNeighborhood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  // Once the person picks a neighborhood themselves, typing an address no longer changes the picks.
  const [neighborhoodsTouched, setNeighborhoodsTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alreadyReviewedThisSemester, setAlreadyReviewedThisSemester] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const api = useApiService();
  const { landlords, addLandlord: apiAddLandlord } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // When the review checkbox is toggled on, move address → propertyAddress
  const handleAddReviewChange = (checked: boolean) => {
    if (checked && address.trim()) {
      setPropertyAddress(prev => prev || address);
    }
    setAddReview(checked);
  };

  // One review per person per semester: if they've used it, they can still add the landlord.
  useEffect(() => {
    if (!user?.id) return;
    api.getCurrentSemesterReviewByUser(user.id)
      .then(existing => setAlreadyReviewedThisSemester(Boolean(existing)))
      .catch(error => console.error('Could not check for an earlier review:', error));
  }, [api, user?.id]);

  // Suggest neighborhoods from the address (streets in siteSettings.ts) until the person chooses.
  useEffect(() => {
    if (neighborhoodsTouched) return;
    const guess = inferNeighborhoodNames([address, propertyAddress].filter(Boolean));
    setSelectedNeighborhoods(guess);
  }, [address, propertyAddress, neighborhoodsTouched]);

  const toggleNeighborhood = (name: string) => {
    setNeighborhoodsTouched(true);
    setSelectedNeighborhoods(current => current.includes(name) ? current.filter(n => n !== name) : [...current, name]);
  };

  // Filter approved landlords whose name contains the typed text
  const suggestions = name.trim().length > 0
    ? landlords
        .filter(l => l.status === 'approved' && l.name.toLowerCase().includes(name.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  // Close name-autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const findExactMatch = (value: string) =>
    landlords.find(
      l => l.status === 'approved' && l.name.toLowerCase() === value.trim().toLowerCase()
    );

  const promptNavigate = (landlordId: number, landlordName: string) => {
    if (window.confirm(`"${landlordName}" already exists. Go to their page?`)) {
      navigate(`/landlord/${landlordId}`);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (id: number, selectedName: string) => {
    setName(selectedName);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    promptNavigate(id, selectedName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const s = suggestions[highlightedIndex];
      handleSelectSuggestion(s.id, s.name);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const includeReview = addReview && !alreadyReviewedThisSemester;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!turnstileToken) { alert('Please complete the security verification.'); return; }
    if (!name) { alert('Please fill in landlord name.'); return; }
    if (selectedNeighborhoods.length === 0) { alert('Please pick a neighborhood. Choose "Other" if none fit.'); return; }

    // Check for exact match before submitting
    const existing = findExactMatch(name);
    if (existing) {
      promptNavigate(existing.id, existing.name);
      return;
    }

    setUploading(true);
    const landlordAddress = removeUnitNumber(address || (includeReview ? propertyAddress : ''));
    const landlordData = {
      name,
      addresses: landlordAddress ? [landlordAddress] : undefined,
      neighborhoods: selectedNeighborhoods,
      city: siteSettings.city,
    };
    let reviewData;
    if (includeReview) {
      reviewData = {
        user_id: user?.id || undefined,
        landlord_rating, building_rating, comment,
        would_rent_again: wouldRentAgain,
        rent_amount: rentAmount ? parseFloat(rentAmount) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        property_address: propertyAddress ? removeUnitNumber(propertyAddress) : undefined,
        neighborhood: reviewNeighborhood || undefined,
        verification_status: 'pending' as const,
        created_by_student: isStudentEmail(user?.email),
        tags,
      };
    }

    try {
      const newLandlord = await apiAddLandlord(landlordData, reviewData);
      alert('Landlord added successfully!');
      navigate(`/landlord/${newLandlord.id}`);
    } catch (err) {
      console.error('Failed to add landlord:', err);
      alert(`Failed to add landlord: ${err?.message || 'Unknown error'}`);
      turnstileRef.current?.reset();
      setTurnstileToken('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-page">
      <h1 className="form-page__title">Add a New Landlord</h1>

      <form onSubmit={handleSubmit} className="form-page__form">
        <div>
          <label htmlFor="name" className="form-label">Landlord/Company Name</label>
          <div ref={wrapperRef} className="autocomplete-wrapper">
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              onFocus={() => name.trim().length > 0 && setShowSuggestions(true)}
              className="form-input"
              autoComplete="off"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="autocomplete-dropdown" role="listbox">
                {suggestions.map((landlord, i) => (
                  <li
                    key={landlord.id}
                    role="option"
                    aria-selected={i === highlightedIndex}
                    className={`autocomplete-option${i === highlightedIndex ? ' autocomplete-option--highlighted' : ''}`}
                    onMouseDown={() => handleSelectSuggestion(landlord.id, landlord.name)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                  >
                    {landlord.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Address field: hidden once the review checkbox is checked */}
        {!includeReview && (
          <div>
            <label htmlFor="address" className="form-label">Property Address (Optional)</label>
            <AddressAutofill
              accessToken={MAPBOX_TOKEN}
              options={{ country: 'US', language: 'en' }}
              onRetrieve={(res: AddressAutofillRetrieveResponse) => {
                const f = res.features[0];
                if (!f) return;
                const p = f.properties;
                const full = [p.address_line1, p.place, p.region, p.postcode]
                  .filter(Boolean).join(', ');
                setTimeout(() => setAddress(full), 0);
              }}
            >
              <input
                type="text"
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="form-input"
                autoComplete="street-address"
                placeholder={siteSettings.addressExample}
              />
            </AddressAutofill>
          </div>
        )}

        <div>
          <span className="form-label" id="neighborhood-label">Neighborhood</span>
          <div className="neighborhood-picker" role="group" aria-labelledby="neighborhood-label">
            {allNeighborhoods.map(n => {
              const active = selectedNeighborhoods.includes(n.name);
              return (
                <button
                  key={n.name}
                  type="button"
                  className={`neighborhood-chip${active ? ' neighborhood-chip--active' : ''}`}
                  aria-pressed={active}
                  onClick={() => toggleNeighborhood(n.name)}
                >
                  {n.name}
                </button>
              );
            })}
          </div>
          <p className="neighborhood-hint">
            Pick every neighborhood this landlord rents in. This is how students find them when they browse by neighborhood. Choose "Other" if none fit.
          </p>
          <SuggestNeighborhood />
        </div>

        <div className="form-divider">
          <label className="form-checkbox-row">
            <input
              type="checkbox"
              checked={includeReview}
              disabled={alreadyReviewedThisSemester}
              onChange={e => handleAddReviewChange(e.target.checked)}
              className="form-checkbox"
            />
            <span style={{ fontWeight: 600, color: 'var(--neutral-400)' }}>Add your review now?</span>
          </label>
          {alreadyReviewedThisSemester && (
            <p className="neighborhood-hint">
              You already posted a review in {semesterLabel(getSemester())}. {SEMESTER_RULE_EXPLANATION} You can still add the landlord without a review.
            </p>
          )}
        </div>

        {includeReview && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', marginBottom: '1rem' }}>Your Review</h2>
            <ReviewForm
              landlord_rating={landlord_rating} setRating={setRating}
              building_rating={building_rating} setBuildingCondition={setBuildingCondition}
              comment={comment} setComment={setComment}
              wouldRentAgain={wouldRentAgain} setWouldRentAgain={setWouldRentAgain}
              rentAmount={rentAmount} setRentAmount={setRentAmount}
              bedrooms={bedrooms} setBedrooms={setBedrooms}
              propertyAddress={propertyAddress} setPropertyAddress={setPropertyAddress}
              neighborhood={reviewNeighborhood} setNeighborhood={setReviewNeighborhood}
              tags={tags} setTags={setTags}
            />
          </div>
        )}

        <TurnstileWidget
          turnstileRef={turnstileRef}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken('')}
          onError={() => setTurnstileToken('')}
        />

        <p className="form-tos">
          By submitting a landlord and/or a review, you agree to our{' '}
          <a href="/terms-and-conditions" rel="noopener noreferrer">Terms and Conditions</a>.
        </p>

        <button
          type="submit"
          disabled={uploading || !turnstileToken}
          className="btn btn-primary btn-full btn-lg"
        >
          {uploading ? 'Submitting...' : 'Submit Landlord'}
        </button>
      </form>
    </div>
  );
};

export default AddLandlordPage;
