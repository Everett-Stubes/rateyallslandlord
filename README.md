# [Rate Yinz Landlord — Pittsburgh](https://rateyinzlandlord.com/)

A community platform for Pittsburgh renters to search, review, and rate landlords. Users can submit reviews with optional student verification, and admins can moderate landlords and reviews.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Build tool:** Vite
- **Testing:** Vitest + Testing Library

## Project Structure

```
App.tsx               # Root component, wires up service layer + routing
pages/                # One file per route
components/           # Shared UI components (Header, Footer, cards, forms)
context/              # React context providers (Auth, Data, Services)
services/             # Service layer
  interfaces.ts       # IApiService / IAuthService interfaces
  SupabaseApiService.ts
  SupabaseAuthService.ts
  MockApiService.ts   # Used when Supabase env vars are not set
  MockAuthService.ts
  supabase.ts         # Client init + isMockMode flag
tests/
  flows/              # Integration-style tests per user flow
  utils/
    renderWithProviders.tsx   # Test render helpers
    createMockServices.ts     # Mock service factories
  setup.ts            # jest-dom setup
types.ts              # Shared TypeScript types (Landlord, Review, etc.)
init.sql              # Database schema
```

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment template and fill in your values:
   ```
   cp .env.local.example .env.local
   ```
   Required variables:
   ```
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

3. Start the dev server (runs on port 3000):
   ```
   npm run dev
   ```

> **Demo / mock mode:** If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, the app automatically runs in mock mode using in-memory fake data. A yellow banner is shown at the top. This is useful for frontend-only development without a Supabase project.

## Documentation & Architecture

For comprehensive guides on the project, check the following resources:
- [Replication & Setup Guide](file:///Ubuntu/home/sebas/coding/ratemylandlord/docs/replication_guide.md) — Step-by-step instructions to configure Supabase (Database, Auth, Storage, SMTP) and host on Cloudflare Pages.
- [Architecture & Background](file:///Ubuntu/home/sebas/coding/ratemylandlord/docs/architecture.md) — Explains the folder structure, Row Level Security (RLS) model, and testing patterns.

The SQL schema and policies are defined in [init.sql](file:///Ubuntu/home/sebas/coding/ratemylandlord/init.sql).

## Service Layer

All backend calls go through two interfaces: `IApiService` and `IAuthService` (see `services/interfaces.ts`). The app selects the real Supabase implementations or the mock implementations at startup based on `isMockMode`.

Tests also use dependency injection to mock services directly rather than mocking fetch/Supabase internals.

## Testing

Tests use **Vitest** with **Testing Library** and run in a **jsdom** environment. There are no network calls in tests — all backend interactions go through the mock service layer.

### Run tests

```bash
# Watch mode (re-runs on file changes)
npm test

# Single run (CI / one-off)
npm run test:run
```

### Test structure

Tests live in `tests/flows/` and are organized by user flow:

| File | What it covers |
|------|----------------|
| `flow1-search.test.tsx` | Searching and filtering landlords |
| `flow2-register.test.tsx` | User registration |
| `flow3-login.test.tsx` | Login / logout |
| `flow4-submit-review-logged-in.test.tsx` | Submitting a review as a logged-in user |
| `flow5-submit-review-guest.test.tsx` | Submitting a review as a guest |
| `flow6-edit-review.test.tsx` | Editing an existing review |
| `flow7-add-landlord.test.tsx` | Adding a new landlord |
| `flow8-admin-landlords.test.tsx` | Admin: managing landlord approvals |
| `flow9-admin-reviews.test.tsx` | Admin: managing review verification |
| `flow10-admin-delete-restore.test.tsx` | Admin: deleting and restoring reviews |
| `flow11-reset-password.test.tsx` | Password reset flow |

### Test helpers

- **`renderPage(ui, options)`** — renders a single page component inside the full provider tree (Services + Auth + Data + Router).
- **`renderWithRoutes(routes, options)`** — renders multiple routes, useful for testing navigation between pages.
- Both helpers accept optional `api` and `auth` overrides so individual tests can customize mock behaviour.

Example:
```tsx
import { renderPage } from '../utils/renderWithProviders';
import { createMockApiService } from '../utils/createMockServices';

it('shows landlord list', async () => {
  const api = createMockApiService();
  const { findByText } = renderPage(<MainPage />, { api });
  expect(await findByText('Some Landlord')).toBeInTheDocument();
});
```

## Building for Production

```bash
npm run build    # outputs to dist/
npm run preview  # serve the built output locally
```

## Contribute:
Note that the actual [website](https://rateyinzlandlord.com/) is on the ui-changes branch.
To contribute, create a new branch and create a pull request with the main branch 
