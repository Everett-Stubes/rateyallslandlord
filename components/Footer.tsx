import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__copy">
          Made by students, for students. 
        </div>
        <div className="site-footer__links">
          <Link to="/terms-and-conditions" className="site-footer__link">Terms &amp; Conditions</Link>
          <Link to="/privacy-policy" className="site-footer__link">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
