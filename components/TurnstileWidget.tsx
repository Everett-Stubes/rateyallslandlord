import React from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  turnstileRef?: React.RefObject<TurnstileInstance>;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ 
  onSuccess, 
  onError, 
  onExpire,
  turnstileRef 
}) => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error('Turnstile site key is not configured');
    return (
      <div className="alert alert-error">
        Security verification is not configured. Please contact support.
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
};

export default TurnstileWidget;
