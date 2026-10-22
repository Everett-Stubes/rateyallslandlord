import React from 'react';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  turnstileRef?: React.RefObject<any>;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onSuccess }) => {
  return (
    <button
      data-testid="captcha-complete"
      type="button"
      onClick={() => onSuccess('test-captcha-token')}
    >
      Complete Captcha
    </button>
  );
};

export default TurnstileWidget;
