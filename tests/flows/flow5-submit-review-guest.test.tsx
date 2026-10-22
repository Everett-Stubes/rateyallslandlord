import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createMockAuthService,
  TEST_LANDLORD,
  TEST_REVIEW,
} from '../utils/createMockServices';
import { getCommentField, getSubmitReviewButton, getGuestBanner } from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

describe('Flow 5: Submit Review (Guest)', () => {
  it('base: not logged in; yellow banner visible; file upload NOT in DOM; complete captcha; type comment; submit → window.confirm called → api.addReview called with user_id: undefined', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlordById: vi.fn().mockResolvedValue(TEST_LANDLORD),
      addReview: vi.fn().mockResolvedValue({ ...TEST_REVIEW, user_id: undefined }),
    });
    const auth = createMockAuthService(); // no session = guest

    const { default: AddReviewPage } = await import('../../pages/AddReviewPage');

    renderWithRoutes(
      [{ path: '/landlord/:id/add-review', element: <AddReviewPage /> }],
      { api, auth, initialRoute: '/landlord/1/add-review' }
    );

    // Wait for the page to load
    await screen.findByText('Test Landlord');

    // Guest banner should be visible
    expect(getGuestBanner()).toBeInTheDocument();

    // File upload input should NOT be in the DOM
    expect(screen.queryByLabelText(/upload/i) || screen.queryByLabelText(/verification/i)).not.toBeInTheDocument();

    // Complete captcha
    await user.click(screen.getByTestId('captcha-complete'));

    // Type comment
    const commentBox = getCommentField();
    await user.type(commentBox, 'Nice place, would recommend.');

    // Submit
    await user.click(getSubmitReviewButton());

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(api.addReview).toHaveBeenCalled();
    });

    // The addReview should have been called with user_id: undefined
    const callArgs = (api.addReview as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs.user_id).toBeUndefined();
  });

  it('edge: window.confirm returns false → api.addReview NOT called', async () => {
    const user = userEvent.setup();
    // Override confirm to return false (user cancels)
    window.confirm = vi.fn(() => false);

    const api = createMockApiService({
      getLandlordById: vi.fn().mockResolvedValue(TEST_LANDLORD),
      addReview: vi.fn().mockResolvedValue(TEST_REVIEW),
    });
    const auth = createMockAuthService();

    const { default: AddReviewPage } = await import('../../pages/AddReviewPage');

    renderWithRoutes(
      [{ path: '/landlord/:id/add-review', element: <AddReviewPage /> }],
      { api, auth, initialRoute: '/landlord/1/add-review' }
    );

    await screen.findByText('Test Landlord');

    // Complete captcha
    await user.click(screen.getByTestId('captcha-complete'));

    // Type comment
    const commentBox = getCommentField();
    await user.type(commentBox, 'Nice place, would recommend.');

    // Submit
    await user.click(getSubmitReviewButton());

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });

    // api.addReview should NOT be called because user cancelled
    expect(api.addReview).not.toHaveBeenCalled();
  });
});
