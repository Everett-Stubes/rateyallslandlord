import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createAdminAuth,
  TEST_ADMIN,
  TEST_REVIEW,
} from '../utils/createMockServices';
import type { Review } from '../../types';
import {
  getPendingReviewsTab,
  getAllApproveButtons,
  getAllRejectButtons,
} from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

const PENDING_REVIEW: Review = {
  ...TEST_REVIEW,
  id: 20,
  verification_status: 'pending',
  comment: 'Pending review comment here.',
};

describe('Flow 9: Admin Reviews', () => {
  it('base: admin; click "Pending Reviews" tab; pending review shown; click Approve → window.confirm → api.updateReviewVerificationStatus(20, "verified") called', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getPendingLandlords: vi.fn().mockResolvedValue([]),
      getPendingReviews: vi.fn().mockResolvedValue([PENDING_REVIEW]),
      updateReviewVerificationStatus: vi.fn().mockResolvedValue(true),
    });
    const auth = createAdminAuth(TEST_ADMIN);

    const { default: AdminPage } = await import('../../pages/AdminPage');

    renderWithRoutes(
      [{ path: '/admin', element: <AdminPage /> }],
      { api, auth, initialRoute: '/admin' }
    );

    // Wait for admin page to render
    await screen.findByText(/admin portal/i);

    // Click the "Pending Reviews" tab
    await user.click(getPendingReviewsTab());

    // Pending review comment should be visible
    await screen.findByText(/pending review comment here/i);

    // Click Approve
    const approveButtons = getAllApproveButtons();
    await user.click(approveButtons[0]);

    // window.confirm should be called
    expect(window.confirm).toHaveBeenCalled();

    // api.updateReviewVerificationStatus should be called with 'verified'
    await waitFor(() => {
      expect(api.updateReviewVerificationStatus).toHaveBeenCalledWith(20, 'verified');
    });
  });

  it('edge: click Reject → api.deleteReview(20) called instead of changing verification status', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getPendingLandlords: vi.fn().mockResolvedValue([]),
      getPendingReviews: vi.fn().mockResolvedValue([PENDING_REVIEW]),
      deleteReview: vi.fn().mockResolvedValue(true),
    });
    const auth = createAdminAuth(TEST_ADMIN);

    const { default: AdminPage } = await import('../../pages/AdminPage');

    renderWithRoutes(
      [{ path: '/admin', element: <AdminPage /> }],
      { api, auth, initialRoute: '/admin' }
    );

    // Wait for admin page to render
    await screen.findByText(/admin portal/i);

    // Click the "Pending Reviews" tab
    await user.click(getPendingReviewsTab());

    // Pending review comment should be visible
    await screen.findByText(/pending review comment here/i);

    // Click Reject
    const rejectButtons = getAllRejectButtons();
    await user.click(rejectButtons[0]);

    // window.confirm should be called
    expect(window.confirm).toHaveBeenCalled();

    // Rejection should use the same soft-delete operation as the home-page delete action.
    await waitFor(() => {
      expect(api.deleteReview).toHaveBeenCalledWith(20);
    });
    expect(api.updateReviewVerificationStatus).not.toHaveBeenCalled();
  });
});
