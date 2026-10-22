import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createAdminAuth,
  TEST_ADMIN,
  TEST_LANDLORD,
  TEST_REVIEW,
} from '../utils/createMockServices';
import type { Review } from '../../types';
import { getDeleteButton, getRestoreButton } from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

const DELETED_REVIEW: Review = {
  ...TEST_REVIEW,
  id: 10,
  is_deleted: true,
  comment: 'This review was deleted.',
};

describe('Flow 10: Admin Delete/Restore Reviews', () => {
  it('base: admin user; LandlordPage with a review; "Delete" button visible; click → window.confirm → deleteReview(10, 1) called', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlordById: vi.fn().mockResolvedValue(TEST_LANDLORD),
      getReviewsByLandlordId: vi.fn().mockResolvedValue([TEST_REVIEW]),
      deleteReview: vi.fn().mockResolvedValue(true),
    });
    const auth = createAdminAuth(TEST_ADMIN);

    const { default: LandlordPage } = await import('../../pages/LandlordPage');

    renderWithRoutes(
      [{ path: '/landlord/:id', element: <LandlordPage /> }],
      { api, auth, initialRoute: '/landlord/1' }
    );

    // Wait for review to appear
    await screen.findByText('Great landlord overall.');

    // Delete button should be visible for admin
    const deleteButton = getDeleteButton();
    expect(deleteButton).toBeInTheDocument();

    // Click delete
    await user.click(deleteButton);

    // window.confirm should have been called
    expect(window.confirm).toHaveBeenCalled();

    // api.deleteReview should have been called with reviewId=10
    await waitFor(() => {
      expect(api.deleteReview).toHaveBeenCalledWith(10);
    });
  });

  it('edge: deleted review visible for admin; "Restore" button visible; click → window.confirm → restoreReview called', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlordById: vi.fn().mockResolvedValue(TEST_LANDLORD),
      getReviewsByLandlordId: vi.fn().mockResolvedValue([DELETED_REVIEW]),
      restoreReview: vi.fn().mockResolvedValue(true),
    });
    const auth = createAdminAuth(TEST_ADMIN);

    const { default: LandlordPage } = await import('../../pages/LandlordPage');

    renderWithRoutes(
      [{ path: '/landlord/:id', element: <LandlordPage /> }],
      { api, auth, initialRoute: '/landlord/1' }
    );

    // Wait for deleted review to appear (admin sees it)
    await screen.findByText('This review was deleted.');

    // Restore button should be visible for admin on deleted review
    const restoreButton = getRestoreButton();
    expect(restoreButton).toBeInTheDocument();

    // Click restore
    await user.click(restoreButton);

    // window.confirm should have been called
    expect(window.confirm).toHaveBeenCalled();

    // api.restoreReview should have been called
    await waitFor(() => {
      expect(api.restoreReview).toHaveBeenCalledWith(10);
    });
  });
});
