import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '../utils/renderWithProviders';
import { createMockApiService, createMockAuthService } from '../utils/createMockServices';
import {
  getEmailField,
  getPasswordField,
  getConfirmPasswordField,
  getSignUpButton,
  findVerifyEmailText,
  findMismatchedPasswordsText,
} from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

describe('Flow 2: Register', () => {
  it('base: fill email + matching passwords + complete captcha + click Sign Up → auth.signUp called → success screen shows email', async () => {
    const user = userEvent.setup();
    const auth = createMockAuthService({
      signUp: vi.fn().mockResolvedValue({ success: true }),
    });
    const api = createMockApiService();

    const { default: RegisterPage } = await import('../../pages/RegisterPage');
    renderPage(<RegisterPage />, { api, auth });

    // Fill the form
    await user.type(getEmailField(), 'newuser@example.com');
    await user.type(getPasswordField(), 'password123');
    await user.type(getConfirmPasswordField(), 'password123');

    // Complete captcha
    await user.click(screen.getByTestId('captcha-complete'));

    // Click Sign Up
    await user.click(getSignUpButton());

    // Should show success screen
    await findVerifyEmailText();
    expect(screen.getByText(/newuser@example\.com/)).toBeInTheDocument();
    expect(auth.signUp).toHaveBeenCalledWith('newuser@example.com', 'password123', expect.any(Object));
  });

  it('edge: mismatched passwords → "Passwords do not match." error; auth.signUp NOT called', async () => {
    const user = userEvent.setup();
    const auth = createMockAuthService({
      signUp: vi.fn().mockResolvedValue({ success: true }),
    });
    const api = createMockApiService();

    const { default: RegisterPage } = await import('../../pages/RegisterPage');
    renderPage(<RegisterPage />, { api, auth });

    await user.type(getEmailField(), 'test@example.com');
    await user.type(getPasswordField(), 'password123');
    await user.type(getConfirmPasswordField(), 'differentpassword');

    // Complete captcha
    await user.click(screen.getByTestId('captcha-complete'));

    // Click Sign Up
    await user.click(getSignUpButton());

    // Should show error
    await findMismatchedPasswordsText();
    expect(auth.signUp).not.toHaveBeenCalled();
  });
});
