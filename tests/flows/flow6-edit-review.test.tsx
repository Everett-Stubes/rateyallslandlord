import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createLoggedInAuth,
  TEST_LANDLORD,
  TEST_REVIEW,
  TEST_USER,
} from '../utils/createMockServices';
import { getUpdateReviewButton } from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

describe('Flow 6: Edit Review', () => {
  it('base: api.getReviewById returns TEST_REVIEW (owned by TEST_USER); form pre-populated with comment; change comment; click Update Review → api.updateReview called with new comment', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlordById: vi.fn().mockResolvedValue(TEST_LANDLORD),
      getReviewById: vi.fn().mockResolvedValue(TEST_REVIEW),
      updateReview: vi.fn().mockResolvedValue(undefined),
    });
    const auth = createLoggedInAuth(TEST_USER);

    const { default: EditReviewPage } = await import('../../pages/EditReviewPage');

    renderWithRoutes(
      [{ path: '/landlord/:id/review/:reviewId/edit', element: <EditReviewPage /> }],
      { api, auth, initialRoute: '/landlord/1/review/10/edit' }
    );

    // Wait for the comment to be pre-populated
    const commentBox = await screen.findByDisplayValue('Great landlord overall.');
    expect(commentBox).toBeInTheDocument();

    // Clear and type new comment
    await user.clear(commentBox);
    await user.type(commentBox, 'Updated comment about the landlord.');

    // Click Update Review
    await user.click(getUpdateReviewButton());

    await waitFor(() => {
      expect(api.updateReview).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ comment: 'Updated comment about the landlord.' })
      );
    });
  });

  it('edge: review owned by different user → alert shown and navigate back', async () => {
    const api = createMockApiService({
      getLandlordById: vi.fn().mockResolvedValue(TEST_LANDLORD),
      getReviewById: vi.fn().mockResolvedValue({
        ...TEST_REVIEW,
        user_id: 'other-user-id',
      }),
    });
    const auth = createLoggedInAuth(TEST_USER);

    const { default: EditReviewPage } = await import('../../pages/EditReviewPage');
    const { default: LandlordPage } = await import('../../pages/LandlordPage');

    renderWithRoutes(
      [
        { path: '/landlord/:id/review/:reviewId/edit', element: <EditReviewPage /> },
        { path: '/landlord/:id', element: <LandlordPage /> },
      ],
      { api, auth, initialRoute: '/landlord/1/review/10/edit' }
    );

    // Should alert and navigate away
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('only edit your own reviews'));
    });
  });
});
