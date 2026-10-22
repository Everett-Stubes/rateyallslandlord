import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRoutes } from '../utils/renderWithProviders';
import {
  createMockApiService,
  createMockAuthService,
} from '../utils/createMockServices';
import type { Landlord } from '../../types';
import { getSearchField, findNoLandlordsFoundText } from '../utils/queryHelpers';

vi.mock('../../components/TurnstileWidget');

const LANDLORD_A: Landlord = {
  id: 1,
  name: 'Test Landlord',
  addresses: ['123 Test St'],
  city: 'Pittsburgh',
  status: 'approved',
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z',
};

const LANDLORD_B: Landlord = {
  id: 2,
  name: 'Another Owner',
  addresses: ['456 Other Ave'],
  city: 'Pittsburgh',
  status: 'approved',
  is_deleted: false,
  created_at: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
});

describe('Flow 1: Search and Navigation', () => {
  it('base: shows 2 landlords; type "Test" to filter; clicking card navigates to landlord page', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlords: vi.fn().mockResolvedValue([LANDLORD_A, LANDLORD_B]),
      getLandlordById: vi.fn().mockResolvedValue(LANDLORD_A),
      getReviewsByLandlordId: vi.fn().mockResolvedValue([]),
    });
    const auth = createMockAuthService();

    const { default: MainPage } = await import('../../pages/MainPage');
    const { default: LandlordPage } = await import('../../pages/LandlordPage');

    renderWithRoutes(
      [
        { path: '/', element: <MainPage /> },
        { path: '/landlord/:id', element: <LandlordPage /> },
      ],
      { api, auth, initialRoute: '/' }
    );

    // Wait for landlords to load
    await screen.findByText('Test Landlord');
    expect(screen.getByText('Another Owner')).toBeInTheDocument();

    // Type in search box
    const searchInput = getSearchField();
    await user.type(searchInput, 'Test');

    // Only Test Landlord should remain
    await waitFor(() => {
      expect(screen.getByText('Test Landlord')).toBeInTheDocument();
      expect(screen.queryByText('Another Owner')).not.toBeInTheDocument();
    });

    // Click the card to navigate
    const landlordCard = screen.getByText('Test Landlord');
    await user.click(landlordCard);

    // Should see landlord page with the name
    await screen.findByRole('heading', { name: /Test Landlord/i });
  });

  it('edge: type "zzzzz" → "No landlords found" text visible', async () => {
    const user = userEvent.setup();
    const api = createMockApiService({
      getLandlords: vi.fn().mockResolvedValue([LANDLORD_A, LANDLORD_B]),
    });
    const auth = createMockAuthService();

    const { default: MainPage } = await import('../../pages/MainPage');

    renderWithRoutes(
      [{ path: '/', element: <MainPage /> }],
      { api, auth, initialRoute: '/' }
    );

    await screen.findByText('Test Landlord');

    const searchInput = getSearchField();
    await user.type(searchInput, 'zzzzz');

    await findNoLandlordsFoundText();
  });
});
