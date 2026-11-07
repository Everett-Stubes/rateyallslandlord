
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ServicesProvider } from './context/ServicesContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { SchoolProvider } from './context/SchoolContext';
import SchoolPicker from './components/SchoolPicker';
import { isStudentEmail, getVerifiedStudentDomains } from './utils/studentVerification';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactPage from './pages/ContactPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import MainPage from './pages/MainPage';
import LandlordPage from './pages/LandlordPage';
import AddLandlordPage from './pages/AddLandlordPage';
import AddReviewPage from './pages/AddReviewPage';
import EditReviewPage from './pages/EditReviewPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ResourcesPage from './pages/ResourcesPage';
import NotFoundPage from './pages/NotFoundPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import LoadingSpinner from './components/LoadingSpinner';
import { isMockMode, supabase } from './services/supabase';
import { SupabaseApiService } from './services/SupabaseApiService';
import { SupabaseAuthService } from './services/SupabaseAuthService';
import { MockApiService } from './services/MockApiService';
import { MockAuthService } from './services/MockAuthService';

const apiService = isMockMode ? new MockApiService() : new SupabaseApiService(supabase!);
const authService = isMockMode ? new MockAuthService() : new SupabaseAuthService(supabase!);

/**
 * Posting (reviews and new landlords) needs an account with a school email from siteSettings.ts.
 * Logged-out visitors go to the login page and come back here afterwards.
 */
function RequireSchoolAccount({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (!isAdmin && !isStudentEmail(user.email)) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1 className="auth-title">School email needed</h1>
          <p className="auth-subtitle">
            You're signed in as <strong>{user.email}</strong>. To post, use an account with a school email
            ({getVerifiedStudentDomains().map(d => `@${d}`).join(', ')}).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/register" onClick={() => logout()} className="btn btn-primary btn-full btn-lg">
              Log out and sign up with a school email
            </Link>
            <Link to="/" className="auth-link-row">Back to landlords</Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="app-shell">
      <Header />
      {isMockMode && (
        <div className="demo-banner">
          Demo mode — showing fake data. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> to connect to a real database.
        </div>
      )}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/landlord/:id" element={<LandlordPage />} />
          <Route
            path="/landlord/:id/add-review"
            element={
              <RequireSchoolAccount>
                <AddReviewPage />
              </RequireSchoolAccount>
            }
          />
          <Route path="/landlord/:id/review/:reviewId/edit" element={<EditReviewPage />} />
          <Route
            path="/add-landlord"
            element={
              <RequireSchoolAccount>
                <AddLandlordPage />
              </RequireSchoolAccount>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <SchoolPicker />
    </div>
  );
}

function App() {
  return (
    <ServicesProvider api={apiService} auth={authService}>
      <AuthProvider>
        <DataProvider>
          <SchoolProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </SchoolProvider>
        </DataProvider>
      </AuthProvider>
    </ServicesProvider>
  );
}

export default App;
