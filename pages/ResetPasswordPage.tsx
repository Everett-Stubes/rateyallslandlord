import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const { updatePassword, logout, verifyOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecoverySession = async () => {
      const queryParams = new URLSearchParams(globalThis.location.search);
      const tokenHash = queryParams.get('token_hash');
      const recoveryType = queryParams.get('type');
      const verifiedTokenKey = 'verified_recovery_token_hash';

      if (!tokenHash || recoveryType !== 'recovery') {
        setError('Invalid or expired password reset link. Please request a new one.');
        setCheckingRecovery(false);
        return;
      }

      const cachedVerifiedToken = sessionStorage.getItem(verifiedTokenKey);
      if (cachedVerifiedToken === tokenHash) {
        setIsValidRecovery(true);
        setCheckingRecovery(false);
        return;
      }

      try {
        const { error: otpErrorMsg } = await verifyOtp({ tokenHash, type: 'recovery' });
        if (otpErrorMsg) {
          if (otpErrorMsg.toLowerCase().includes('expired')) {
            setError('The password reset link has expired. Please request a new one from the login page.');
          } else {
            setError('Invalid or expired password reset link. Please request a new one.');
          }
        } else {
          sessionStorage.setItem(verifiedTokenKey, tokenHash);
          setIsValidRecovery(true);
        }
      } catch (err) {
        console.error('Error verifying reset token:', err);
        setError('Unable to verify password reset link.');
      } finally {
        setCheckingRecovery(false);
      }
    };
    void checkRecoverySession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!isValidRecovery) { setError('Invalid password reset session.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (result.success) {
      sessionStorage.removeItem('verified_recovery_token_hash');
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => { void logout(); navigate('/login'); }, 2000);
    } else {
      setError(result.error || 'Failed to update password.');
    }
  };

  if (checkingRecovery) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="spinner"></div>
          </div>
          <p style={{ color: 'var(--neutral-300)' }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidRecovery) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Invalid Link</h1>
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error || 'This password reset link is invalid or has expired.'}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--neutral-300)', marginBottom: '1.5rem' }}>
            Please request a new password reset link from the login page.
          </p>
          <button onClick={() => navigate('/login')} className="btn btn-primary btn-full btn-lg">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>

        <form onSubmit={handleResetPassword} className="auth-form">
          <div>
            <label htmlFor="password" className="form-label">New Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="form-input" placeholder="••••••••" required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <input
              type="password" id="confirmPassword" value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className="form-input" placeholder="••••••••" required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
