import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TurnstileWidget from '../components/TurnstileWidget';
import { TurnstileInstance } from '@marsidev/react-turnstile';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  // The login form and the reset-password popup each have their own security check.
  // A Turnstile token works only once, so each widget is reset after it is used.
  const [loginToken, setLoginToken] = useState<string>('');
  const loginTurnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { login, resetPassword, resendVerification, loading } = useAuth();

  const resetLoginCheck = () => {
    loginTurnstileRef.current?.reset();
    setLoginToken('');
  };
  const navigate = useNavigate();
  const location = useLocation();
  // Set when a logged-out visitor tried to post; we send them back there after login.
  const from = (location.state as { from?: string } | null)?.from;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setResendMessage('');
    if (!loginToken) { setError('Please complete the security verification.'); return; }
    const result = await login(email, password, loginToken);
    resetLoginCheck();
    if (result.success) {
      navigate(from ?? '/', { replace: true });
    } else {
      setError(result.error || 'Invalid email or password.');
      if (result.emailNotVerified) setEmailNotVerified(true);
    }
  };

  const handleResendVerification = async () => {
    if (!email) { setResendMessage('Please enter your email address.'); return; }
    if (!loginToken) { setResendMessage('Please complete the security verification above, then try again.'); return; }
    try {
      const result = await resendVerification(email, loginToken);
      if (!result.success) console.error('Error resending verification email:', result.error);
    } catch (err) {
      console.error('Error resending verification email:', err);
    }
    resetLoginCheck();
    setResendMessage('If this account exists and is unverified, a new verification email has been sent. Please check your inbox and spam folder.');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    if (!turnstileToken) { setResetError('Please complete the security verification.'); return; }
    if (!resetEmail) { setResetError('Please enter your email address.'); return; }
    const result = await resetPassword(resetEmail, turnstileToken);
    if (result.success) {
      turnstileRef.current?.reset();
      setResetMessage('Password reset email sent! Please check your inbox.');
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail('');
        setResetMessage('');
        setTurnstileToken('');
      }, 3000);
    } else {
      setResetError(result.error || 'Failed to send reset email.');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        {from && (
          <div className="alert alert-info auth-post-notice">
            Log in with your school email to post. No account yet?{' '}
            <Link to="/register">Make one in a minute</Link>.
          </div>
        )}
        <form onSubmit={handleLogin} className="auth-form">
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="form-input" placeholder="you@school.edu" autoComplete="email" required
            />
          </div>
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="form-input" required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <TurnstileWidget
              turnstileRef={loginTurnstileRef}
              onSuccess={(token) => setLoginToken(token)}
              onExpire={() => setLoginToken('')}
              onError={() => setLoginToken('')}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'var(--primary-300)', fontSize: '0.875rem' }}>{error}</p>
              {emailNotVerified && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button type="button" onClick={handleResendVerification} className="auth-link-btn" style={{ textAlign: 'left' }}>
                    Resend Verification Email
                  </button>
                  {resendMessage && (
                    <p style={{ fontSize: '0.875rem', color: resendMessage.includes('sent') ? 'var(--highlight-300)' : 'var(--primary-300)' }}>
                      {resendMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || !loginToken} className="btn btn-primary btn-full btn-lg">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link-row">
          Don't have an account? <Link to="/register">Sign up with your school email</Link>
        </div>
        <div className="auth-link-row">
          <button onClick={() => setShowResetModal(true)} className="auth-link-btn">
            Forgot password?
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Reset Password</h2>
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="resetEmail" className="form-label">Email Address</label>
                <input
                  type="email" id="resetEmail" value={resetEmail}
                  onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                  className="form-input" placeholder="Enter your email" required
                />
              </div>
              <TurnstileWidget
                turnstileRef={turnstileRef}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
              />
              {resetError && <p style={{ color: 'var(--primary-300)', fontSize: '0.875rem' }}>{resetError}</p>}
              {resetMessage && <p style={{ color: 'var(--highlight-300)', fontSize: '0.875rem' }}>{resetMessage}</p>}
              <div className="form-btn-row">
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setResetEmail(''); setResetError(''); setResetMessage(''); setTurnstileToken(''); turnstileRef.current?.reset(); }}
                  className="btn btn-gray-light"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!turnstileToken}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
