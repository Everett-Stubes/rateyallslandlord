import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const { verifyOtp, exchangeCodeForSession, user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  const handleSuccess = useCallback(() => {
    setStatus('success');
    setTimeout(() => { navigate('/', { replace: true }); }, 3000);
  }, [navigate]);

  const handleError = useCallback((message: string) => {
    setStatus('error');
    setErrorMessage(message);
  }, []);

  useEffect(() => {
    if (hasChecked.current || authLoading) return;
    hasChecked.current = true;

    const queryParams = new URLSearchParams(globalThis.location.search);
    const hashParams = new URLSearchParams(globalThis.location.hash.replace(/^#/, ''));
    const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');
    const rawType = queryParams.get('type') || hashParams.get('type');
    const code = queryParams.get('code');
    const verificationFlow = queryParams.get('verification') === '1';
    const callbackError = queryParams.get('error_description') || hashParams.get('error_description');

    if (callbackError) {
      handleError(`Email verification failed: ${callbackError}`);
      return;
    }

    if (!tokenHash && !code && !hashParams.get('access_token') && !verificationFlow && !user) {
      handleError('Invalid verification link. Please request a new one by registering again.');
      return;
    }

    const verifyWithTokenHash = async () => {
      try {
        if (code) {
          const { error } = await exchangeCodeForSession(code);
          if (!error) {
            handleSuccess();
            return;
          }
          if (user || verificationFlow) {
            handleSuccess();
            return;
          }
          handleError(`Email verification failed: ${error}`);
          return;
        }

        if (!tokenHash) {
          if (hashParams.get('access_token') || verificationFlow || user) {
            handleSuccess();
          } else {
            handleError('Invalid verification link. Please request a new one by registering again.');
          }
          return;
        }

        const allowedTypes = ['signup', 'invite', 'email', 'email_change'] as const;
        const explicitType = (allowedTypes as readonly string[]).includes(rawType ?? '')
          ? (rawType as (typeof allowedTypes)[number])
          : null;
        const candidateTypes: Array<(typeof allowedTypes)[number]> = explicitType ? [explicitType] : ['signup', 'email'];
        let lastErrorMessage = 'Email verification failed.';

        for (const otpType of candidateTypes) {
          const { error } = await verifyOtp({ tokenHash, type: otpType });
          if (!error) { handleSuccess(); return; }
          lastErrorMessage = error || lastErrorMessage;
          if (lastErrorMessage.toLowerCase().includes('expired') || lastErrorMessage.toLowerCase().includes('already')) break;
        }

        if (lastErrorMessage.toLowerCase().includes('expired')) {
          handleError('The verification link has expired. Please request a new one by registering again.');
          return;
        }
        if (lastErrorMessage.toLowerCase().includes('already')) {
          handleError('This verification link was already used. Try logging in, or request another verification email.');
          return;
        }
        handleError(`Email verification failed: ${lastErrorMessage}`);
      } catch (error) {
        console.error('Error verifying email token:', error);
        handleError('An error occurred while verifying your email. Please try again later.');
      }
    };

    void verifyWithTokenHash();
  }, [authLoading, user, verifyOtp, exchangeCodeForSession, handleSuccess, handleError]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        {status === 'verifying' && (
          <>
            <div className="verify-spinner-wrap">
              <div className="spinner"></div>
            </div>
            <h1 className="verify-title">Verifying Your Email</h1>
            <p className="verify-text">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-spinner-wrap">
              <svg style={{ width: '3rem', height: '3rem', color: 'var(--highlight-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="verify-title">Account Verified!</h1>
            <p className="verify-text">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <p className="verify-hint">Redirecting to home page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-spinner-wrap">
              <svg style={{ width: '3rem', height: '3rem', color: 'var(--primary-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="verify-title">Verification Failed</h1>
            <p className="verify-text">{errorMessage}</p>
            <button onClick={() => navigate('/register')} className="btn btn-primary">
              Return to Registration
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
