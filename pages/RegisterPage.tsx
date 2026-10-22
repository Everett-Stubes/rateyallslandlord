import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TurnstileWidget from '../components/TurnstileWidget';
import { TurnstileInstance } from '@marsidev/react-turnstile';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!turnstileToken) { setError('Please complete the security verification.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    try {
      const result = await register(email, password);
      if (result) {
        setSuccess(true);
      } else {
        turnstileRef.current?.reset();
        setTurnstileToken('');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="verify-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '2rem', height: '2rem', color: 'var(--primary-300)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neutral-500)', marginBottom: '1rem' }}>Verify your email</h2>
          <p style={{ color: 'var(--neutral-300)', marginBottom: '2rem' }}>
            We've sent a verification link to <strong style={{ color: 'var(--neutral-500)' }}>{email}</strong>.
            Please check your inbox and click the link to activate your account.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/login" className="btn btn-primary btn-full btn-lg">
              Return to Login
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-400)' }}>
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the community to rate and review</p>

        <form onSubmit={handleRegister} className="auth-form">
          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="form-input" placeholder="you@example.com" required
            />
          </div>
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="form-input" placeholder="••••••••" required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password" id="confirmPassword" value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className="form-input" placeholder="••••••••" required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <TurnstileWidget
              turnstileRef={turnstileRef}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken('')}
              onError={() => setTurnstileToken('')}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !turnstileToken} className="btn btn-primary btn-full btn-lg">
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg className="animate-spin" style={{ width: '1.25rem', height: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : 'Sign Up'}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
