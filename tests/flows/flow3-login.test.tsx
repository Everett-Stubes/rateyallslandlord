import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import { createMockApiService, createMockAuthService, TEST_USER } from '../utils/createMockServices';
import {
  getEmailField,
  getPasswordField,
  getLoginButton,
  findLoginHeading,
  findHomeHeading,
  findUnverifiedEmailText,
  getResendEmailButton,
} from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

describe('Flow 3: Login', () => {
  it('base: fill email + password + click Login → auth.signIn called → navigate to home page', async () => {
    const user = userEvent.setup();
    const auth = createMockAuthService({
      signIn: vi.fn().mockResolvedValue({ success: true, user: TEST_USER }),
      checkIsAdmin: vi.fn().mockResolvedValue(false),
    });
    const api = createMockApiService({
      getLandlords: vi.fn().mockResolvedValue([]),
    });

    const { default: LoginPage } = await import('../../pages/LoginPage');
    const { default: MainPage } = await import('../../pages/MainPage');

    renderWithRoutes(
      [
        { path: '/', element: <MainPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
      { api, auth, initialRoute: '/login' }
    );

    // Wait for login page to appear
    await findLoginHeading();

    await user.type(getEmailField(), 'test@pitt.edu');
    await user.type(getPasswordField(), 'mypassword');

    await user.click(getLoginButton());

    // auth.signIn should be called with correct args
    await waitFor(() => {
      expect(auth.signIn).toHaveBeenCalledWith('test@pitt.edu', 'mypassword');
    });

    // Should navigate to home page
    await findHomeHeading();
  });

  it('edge: auth.signIn returns emailNotVerified → error shown + "Resend Verification Email" button visible', async () => {
    const user = userEvent.setup();
    const auth = createMockAuthService({
      signIn: vi.fn().mockResolvedValue({
        success: false,
        emailNotVerified: true,
        error: 'Your email is not verified',
      }),
    });
    const api = createMockApiService();

    const { default: LoginPage } = await import('../../pages/LoginPage');

    renderWithRoutes(
      [{ path: '/login', element: <LoginPage /> }],
      { api, auth, initialRoute: '/login' }
    );

    await findLoginHeading();

    await user.type(getEmailField(), 'unverified@pitt.edu');
    await user.type(getPasswordField(), 'mypassword');

    await user.click(getLoginButton());

    // Should show error message
    await findUnverifiedEmailText();

    // Should show resend verification button
    expect(getResendEmailButton()).toBeInTheDocument();
  });
});
