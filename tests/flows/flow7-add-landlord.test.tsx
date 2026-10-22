import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createMockAuthService,
  createLoggedInAuth,
  TEST_LANDLORD,
  TEST_USER,
} from '../utils/createMockServices';
import {
  findAddLandlordHeading,
  getLandlordNameField,
  getSubmitLandlordButton,
  findLoginHeading,
} from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

describe('Flow 7: Add Landlord', () => {
  it('base: logged-in user; fill landlord name; complete captcha; submit → api.addLandlord called → navigated to /landlord/999', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlords: vi.fn().mockResolvedValue([]),
      getLandlordById: vi.fn().mockResolvedValue({ ...TEST_LANDLORD, id: 999 }),
      getReviewsByLandlordId: vi.fn().mockResolvedValue([]),
      addLandlord: vi.fn().mockResolvedValue({ ...TEST_LANDLORD, id: 999 }),
    });
    const auth = createLoggedInAuth(TEST_USER);

    const { default: AddLandlordPage } = await import('../../pages/AddLandlordPage');
    const { default: LandlordPage } = await import('../../pages/LandlordPage');

    renderWithRoutes(
      [
        { path: '/add-landlord', element: <AddLandlordPage /> },
        { path: '/landlord/:id', element: <LandlordPage /> },
      ],
      { api, auth, initialRoute: '/add-landlord' }
    );

    // Wait for the page to render
    await findAddLandlordHeading();

    // Fill in landlord name
    await user.type(getLandlordNameField(), 'New Test Landlord');

    // Complete captcha
    await user.click(screen.getByTestId('captcha-complete'));

    // Click submit
    await user.click(getSubmitLandlordButton());

    await waitFor(() => {
      expect(api.addLandlord).toHaveBeenCalled();
    });

    // Should have navigated to /landlord/999
    await screen.findByText('Test Landlord');
  });

  it('edge: not logged in; fill form; submit → navigates to /login', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlords: vi.fn().mockResolvedValue([]),
    });
    const auth = createMockAuthService(); // no session = guest

    const { default: AddLandlordPage } = await import('../../pages/AddLandlordPage');
    const { default: LoginPage } = await import('../../pages/LoginPage');

    renderWithRoutes(
      [
        { path: '/add-landlord', element: <AddLandlordPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
      { api, auth, initialRoute: '/add-landlord' }
    );

    await findAddLandlordHeading();

    // Fill in landlord name
    await user.type(getLandlordNameField(), 'Some Landlord');

    // Complete captcha to enable submit button
    await user.click(screen.getByTestId('captcha-complete'));

    // Click submit - user check happens first before turnstile check
    await user.click(getSubmitLandlordButton());

    // Should redirect to login page
    await findLoginHeading();
  });
});
