import React from 'react';
import { Link } from 'react-router-dom';
import { siteSettings } from '../siteSettings';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__copy">
          <strong>{siteSettings.siteName}</strong>
          <br />
          Made by students, for {siteSettings.city} renters. A More Perfect University project.
        </div>
        <div className="site-footer__links">
          <Link to="/about" className="site-footer__link">About</Link>
          <Link to="/resources" className="site-footer__link">Renter Resources</Link>
          <Link to="/terms-and-conditions" className="site-footer__link">Terms &amp; Conditions</Link>
          <Link to="/privacy-policy" className="site-footer__link">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
