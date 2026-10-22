import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { login, resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setResendMessage('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid email or password.');
      if (result.emailNotVerified) setEmailNotVerified(true);
    }
  };

  const handleResendVerification = async () => {
    if (!email) { setResendMessage('Please enter your email address.'); return; }
    try {
      const { supabase } = await import('../services/supabase');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: { emailRedirectTo: `${globalThis.location.origin}/verify-email` },
      });
      if (error) console.error('Error resending verification email:', error);
      setResendMessage('If this account exists and is unverified, a new verification email has been sent. Please check your inbox and spam folder.');
    } catch (err) {
      console.error('Error resending verification email:', err);
      setResendMessage('If this account exists and is unverified, a new verification email has been sent. Please check your inbox and spam folder.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    if (!turnstileToken) { setResetError('Please complete the security verification.'); return; }
    if (!resetEmail) { setResetError('Please enter your email address.'); return; }
    const result = await resetPassword(resetEmail);
    if (result.success) {
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
        <form onSubmit={handleLogin} className="auth-form">
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="form-input" required
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

          <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link-row">
          Don't have an account? <Link to="/register">Sign up</Link>
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
