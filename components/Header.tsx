
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import miniLogo from '../mini-logo.png';

const NAV_LINKS = [
  { label: 'Resources', to: '/resources' },
  { label: 'Contact Support', to: '/contact' },
  { label: 'About', to: '/about' },
];

const Header: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* Logo */}
        <Link to="/" className="site-logo" onClick={() => setMenuOpen(false)}>
          <img src={miniLogo} alt="Rate Your Landlord [insert location]" className="site-logo__img" />
        </Link>

        {/* Desktop nav links */}
        <nav className="site-nav">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`site-nav__link${isActive(to) ? ' site-nav__link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="site-header__auth">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="header-admin-badge">
                  <span className="admin-dot"></span>
                  Admin Portal
                </Link>
              )}
              <div className="header-user-info">
                <span className="header-user-email">{user.email}</span>
                <span className="header-user-role">{isAdmin ? 'Administrator' : 'Member'}</span>
              </div>
              <div className="avatar">{user.email?.[0].toUpperCase()}</div>
              <button onClick={handleLogout} className="header-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-login-link">Log in</Link>
              <Link to="/register" className="header-signup-btn">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="header-mobile-controls">
          {!user && (
            <>
              <Link to="/login" className="header-login-link">Log in</Link>
              <Link to="/register" className="header-signup-btn">Sign Up</Link>
            </>
          )}
          {user && <div className="avatar">{user.email?.[0].toUpperCase()}</div>}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="mobile-menu-btn"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`mobile-menu__link${isActive(to) ? ' mobile-menu__link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
          {user && (
            <>
              <hr className="mobile-menu__divider" />
              <div className="mobile-menu__user-email">{user.email}</div>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="mobile-menu__admin-link">
                  <span className="admin-dot"></span>
                  Admin Portal
                </Link>
              )}
              <button onClick={handleLogout} className="mobile-menu__logout">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
