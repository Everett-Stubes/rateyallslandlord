import React from 'react';
import { siteSettings } from '../siteSettings';

const subject = encodeURIComponent('Neighborhood suggestion');
const body = encodeURIComponent('Neighborhood name:\nWhich streets or area it covers (optional):\n');

/** A small "don't see your neighborhood?" note that opens an email to the site's contact address. */
const SuggestNeighborhood: React.FC<{ className?: string }> = ({ className = 'neighborhood-hint' }) => (
  <p className={className}>
    Don't see your neighborhood?{' '}
    <a href={`mailto:${siteSettings.contactEmail}?subject=${subject}&body=${body}`}>Email us</a>{' '}
    and we'll add it.
  </p>
);

export default SuggestNeighborhood;
