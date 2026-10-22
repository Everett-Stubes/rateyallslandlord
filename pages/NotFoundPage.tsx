import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-page__number">404</div>
      <h1 className="not-found-page__title">Page Not Found</h1>
      <p className="not-found-page__desc">
        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary btn-xl">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
