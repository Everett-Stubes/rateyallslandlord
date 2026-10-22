import React from 'react';
import { AddressAutofill } from '@mapbox/search-js-react';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export const REVIEW_TAGS = [
  'Communicative',
  'Invasive',
  'Slow Communication',
  'Junk Fees',
  'Timely Maintenance',
  'Understanding',
  'Unnecessary Paperwork',
  'Lawyer Up!',
  'Rodent Infestations',
  'So Many Bugs',
  'Mold',
  'Peeling Paint',
  'Pet Friendly',
  'Pet Unfriendly',
  'Raised the Rent',
] as const;

interface ReviewFormProps {
  landlord_rating: number;
  setRating: (value: number) => void;
  building_rating: number;
  setBuildingCondition: (value: number) => void;
  comment: string;
  setComment: (value: string) => void;
  wouldRentAgain: boolean;
  setWouldRentAgain: (value: boolean) => void;
  rentAmount: string;
  setRentAmount: (value: string) => void;
  bedrooms: string;
  setBedrooms: (value: string) => void;
  propertyAddress: string;
  setPropertyAddress: (value: string) => void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  landlord_rating, setRating,
  building_rating, setBuildingCondition,
  wouldRentAgain, setWouldRentAgain,
  comment, setComment,
  rentAmount, setRentAmount,
  bedrooms, setBedrooms,
  propertyAddress, setPropertyAddress,
  tags = [], setTags,
}) => {
  const toggleTag = (tag: string) => {
    if (!setTags) return;
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="review-form">
      <div>
        <label className="form-label">Landlord Quality: {landlord_rating}/5</label>
        <div className="rating-btn-row">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => setRating(n)} className={`rating-btn${landlord_rating === n ? ' rating-btn--active' : ''}`}>{n}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Building Condition: {building_rating}/5</label>
        <div className="rating-btn-row">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => setBuildingCondition(n)} className={`rating-btn${building_rating === n ? ' rating-btn--active' : ''}`}>{n}</button>
          ))}
        </div>
      </div>

      {setTags && (
        <div>
          <label className="form-label">
            Tags <span style={{ color: 'var(--primary-300)', fontWeight: 400, textTransform: 'none' }}>(select all that apply)</span>
          </label>
          <div className="tag-grid">
            {REVIEW_TAGS.map(tag => {
              const selected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`tag-btn${selected ? ' tag-btn--selected' : ''}`}
                >
                  {selected && <span style={{ marginRight: '0.25rem' }}>✓</span>}{tag}
                </button>
              );
            })}
          </div>
          {tags.length > 0 && (
            <p className="tag-count-hint">{tags.length} tag{tags.length !== 1 ? 's' : ''} selected</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="comment" className="form-label">Comment</label>
        <textarea
          id="comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="form-textarea"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={wouldRentAgain}
            onChange={e => setWouldRentAgain(e.target.checked)}
            className="form-checkbox"
          />
          Would you rent again from this landlord?
        </label>
      </div>

      <div>
        <label htmlFor="rentAmount" className="form-label">How much was rent plus utilities?</label>
        <input
          type="number"
          id="rentAmount"
          value={rentAmount}
          onChange={e => setRentAmount(e.target.value)}
          min="0"
          step="1"
          placeholder="e.g., 1200.00"
          className="form-input"
          required
        />
      </div>

      <div>
        <label htmlFor="bedrooms" className="form-label">Number of Bedrooms</label>
        <input
          type="number"
          id="bedrooms"
          value={bedrooms}
          onChange={e => setBedrooms(e.target.value)}
          min="0"
          step="1"
          placeholder="e.g., 2"
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="propertyAddress" className="form-label">Property Address</label>
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
            setTimeout(() => setPropertyAddress(full), 0);
          }}
        >
          <input
            type="text"
            id="propertyAddress"
            value={propertyAddress}
            onChange={e => setPropertyAddress(e.target.value)}
            placeholder="e.g., 123 Main St, Pittsburgh, PA"
            className="form-input"
            autoComplete="street-address"
            required
          />
        </AddressAutofill>
      </div>
    </div>
  );
};

export default ReviewForm;
