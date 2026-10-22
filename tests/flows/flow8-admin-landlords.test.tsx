import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createMockAuthService,
  createAdminAuth,
  TEST_ADMIN,
  TEST_LANDLORD,
} from '../utils/createMockServices';
import type { Landlord } from '../../types';
import { getApproveButton, findHomeHeading } from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

const PENDING_LANDLORD: Landlord = {
  ...TEST_LANDLORD,
  id: 1,
  name: 'Test Landlord',
  status: 'pending',
};

describe('Flow 8: Admin Landlords', () => {
  it('base: admin user; pending landlord shown; click Approve → window.confirm → api.updateLandlordStatus(1, "approved") called', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getPendingLandlords: vi.fn().mockResolvedValue([PENDING_LANDLORD]),
      getPendingReviews: vi.fn().mockResolvedValue([]),
      updateLandlordStatus: vi.fn().mockResolvedValue(true),
    });
    const auth = createAdminAuth(TEST_ADMIN);

    const { default: AdminPage } = await import('../../pages/AdminPage');

    renderWithRoutes(
      [{ path: '/admin', element: <AdminPage /> }],
      { api, auth, initialRoute: '/admin' }
    );

    // Wait for admin page to render with pending landlord
    await screen.findByText('Test Landlord');

    // Click Approve
    await user.click(getApproveButton());

    // window.confirm should have been called
    expect(window.confirm).toHaveBeenCalled();

    // api.updateLandlordStatus should have been called
    await waitFor(() => {
      expect(api.updateLandlordStatus).toHaveBeenCalledWith(1, 'approved');
    });
  });

  it('edge: non-admin user → navigate("/") called → home page shown instead of admin page', async () => {
    const api = createMockApiService({
      getLandlords: vi.fn().mockResolvedValue([]),
    });
    // Non-admin: getSession returns a user but checkIsAdmin returns false
    const auth = createMockAuthService({
      getSession: vi.fn().mockResolvedValue({ id: 'user-123', email: 'regular@example.com' }),
      checkIsAdmin: vi.fn().mockResolvedValue(false),
    });

    const { default: AdminPage } = await import('../../pages/AdminPage');
    const { default: MainPage } = await import('../../pages/MainPage');

    renderWithRoutes(
      [
        { path: '/', element: <MainPage /> },
        { path: '/admin', element: <AdminPage /> },
      ],
      { api, auth, initialRoute: '/admin' }
    );

    // Admin page redirects non-admins to '/', so home page content should appear
    await findHomeHeading();

    // Admin portal should NOT be visible
    expect(screen.queryByText(/admin portal/i)).not.toBeInTheDocument();
  });
});
