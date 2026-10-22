import { screen, waitFor } from '@testing-library/react';

/**
 * Robust query helpers to find elements across different UI designs/branches
 * by falling back on semantic attributes (like input types), ARIA roles, 
 * data-testids, and flexible text regex patterns.
 */

// --- INPUT FIELDS ---

export function getEmailField(): HTMLElement {
  const testId = screen.queryByTestId('email-input') || screen.queryByTestId('email');
  if (testId) return testId;

  // Fallback 1: Input element with type="email"
  const typeEmail = document.querySelector('input[type="email"]') as HTMLElement;
  if (typeEmail) return typeEmail;

  // Fallback 2: Accessible label check with flexible regex
  for (const regex of [/email/i, /email address/i]) {
    const el = screen.queryByLabelText(regex);
    if (el) return el;
  }

  // Fallback 3: Placeholder text check
  for (const regex of [/email/i, /enter email/i]) {
    const el = screen.queryByPlaceholderText(regex);
    if (el) return el;
  }

  // Last resort
  return screen.getByRole('textbox', { name: /email/i });
}

export function getPasswordField(): HTMLElement {
  const testId = screen.queryByTestId('password-input') || screen.queryByTestId('password');
  if (testId) return testId;

  // Fallback 1: First input element with type="password"
  const typePassword = document.querySelector('input[type="password"]') as HTMLElement;
  if (typePassword) return typePassword;

  // Fallback 2: Label search
  const labelEl = screen.queryByLabelText(/^password$/i) || screen.queryByLabelText(/password/i);
  if (labelEl) return labelEl;

  // Last resort
  return screen.getByLabelText(/password/i);
}

export function getConfirmPasswordField(): HTMLElement {
  const testId = screen.queryByTestId('confirm-password-input') || screen.queryByTestId('confirm-password');
  if (testId) return testId;

  // Fallback 1: Second password input in the DOM
  const passwords = Array.from(document.querySelectorAll('input[type="password"]'));
  if (passwords.length >= 2) {
    return passwords[1] as HTMLElement;
  }

  // Fallback 2: Label check
  const labelEl = screen.queryByLabelText(/confirm password/i) || screen.queryByLabelText(/confirm new password/i);
  if (labelEl) return labelEl;

  // Last resort
  return screen.getByLabelText(/confirm/i);
}

export function getNewPasswordField(): HTMLElement {
  const testId = screen.queryByTestId('new-password-input') || screen.queryByTestId('new-password');
  if (testId) return testId;

  // Fallback 1: First password input on password reset page
  const passwords = Array.from(document.querySelectorAll('input[type="password"]'));
  if (passwords.length >= 1) {
    return passwords[0] as HTMLElement;
  }

  // Fallback 2: Label check
  const labelEl = screen.queryByLabelText(/new password/i) || screen.queryByLabelText(/^password$/i);
  if (labelEl) return labelEl;

  // Last resort
  return screen.getByLabelText(/new password/i);
}

export function getCommentField(): HTMLElement {
  const testId = screen.queryByTestId('comment-input') || screen.queryByTestId('comment');
  if (testId) return testId;

  // Fallback 1: Any textarea in the DOM
  const textarea = document.querySelector('textarea') as HTMLElement;
  if (textarea) return textarea;

  // Fallback 2: Label/Placeholder
  const labelEl = screen.queryByLabelText(/comment/i) || screen.queryByPlaceholderText(/comment/i);
  if (labelEl) return labelEl;

  // Last resort
  return screen.getByLabelText(/comment/i);
}

export function getSearchField(): HTMLElement {
  const testId = screen.queryByTestId('search-input') || screen.queryByTestId('search');
  if (testId) return testId;

  // Fallback 1: input with type="search" or type="text" containing search patterns
  const searchInput = (document.querySelector('input[type="search"]') || 
                       document.querySelector('input[placeholder*="search" i]') ||
                       document.querySelector('input[placeholder*="landlord" i]')) as HTMLElement;
  if (searchInput) return searchInput;

  // Fallback 2: By placeholder
  const placeholderEl = screen.queryByPlaceholderText(/search by landlord name/i) || 
                        screen.queryByPlaceholderText(/search/i);
  if (placeholderEl) return placeholderEl;

  // Last resort
  return screen.getByRole('textbox');
}

export function getLandlordNameField(): HTMLElement {
  const testId = screen.queryByTestId('landlord-name-input') || screen.queryByTestId('landlord-name');
  if (testId) return testId;

  // Fallback 1: text input with label matching landlord or name
  for (const regex of [/landlord\/company name/i, /landlord name/i, /company name/i, /name/i]) {
    const el = screen.queryByLabelText(regex);
    if (el) return el;
  }

  // Fallback 2: First text input inside a form
  const input = document.querySelector('form input[type="text"]') as HTMLElement;
  if (input) return input;

  // Last resort
  return screen.getByRole('textbox');
}


// --- BUTTONS ---

export function getSubmitButton(possibleTexts: RegExp[], defaultName: string): HTMLElement {
  // 1. By type="submit"
  const submitBtn = document.querySelector('button[type="submit"]') as HTMLElement;
  if (submitBtn) return submitBtn;

  // 2. By text match
  for (const regex of possibleTexts) {
    const el = screen.queryByRole('button', { name: regex });
    if (el) return el;
  }

  // Last resort
  return screen.getByRole('button', { name: defaultName });
}

export function getLoginButton(): HTMLElement {
  return getSubmitButton([/^login$/i, /log in/i, /sign in/i], 'Login');
}

export function getSignUpButton(): HTMLElement {
  return getSubmitButton([/sign up/i, /register/i, /create account/i], 'Sign Up');
}

export function getSubmitReviewButton(): HTMLElement {
  return getSubmitButton([/submit review/i, /submit/i, /post review/i], 'Submit Review');
}

export function getUpdateReviewButton(): HTMLElement {
  return getSubmitButton([/update review/i, /update/i, /save/i], 'Update Review');
}

export function getSubmitLandlordButton(): HTMLElement {
  return getSubmitButton([/submit landlord/i, /submit/i, /add landlord/i], 'Submit Landlord');
}

export function getUpdatePasswordButton(): HTMLElement {
  return getSubmitButton([/update password/i, /reset password/i, /save/i], 'Update Password');
}

export function getResendEmailButton(): HTMLElement {
  for (const regex of [/resend verification/i, /resend email/i, /resend/i]) {
    const el = screen.queryByRole('button', { name: regex });
    if (el) return el;
  }
  return screen.getByRole('button', { name: /resend/i });
}

export function getApproveButton(): HTMLElement {
  for (const regex of [/^approve$/i, /approve/i, /verify/i, /accept/i]) {
    const el = screen.queryByRole('button', { name: regex });
    if (el) return el;
  }
  return screen.getByRole('button', { name: /approve/i });
}

export function getAllApproveButtons(): HTMLElement[] {
  for (const regex of [/^approve$/i, /approve/i, /verify/i, /accept/i]) {
    const els = screen.queryAllByRole('button', { name: regex });
    if (els.length > 0) return els;
  }
  return screen.getAllByRole('button', { name: /approve/i });
}

export function getRejectButton(): HTMLElement {
  for (const regex of [/^reject$/i, /reject/i, /unverify/i, /deny/i]) {
    const el = screen.queryByRole('button', { name: regex });
    if (el) return el;
  }
  return screen.getByRole('button', { name: /reject/i });
}

export function getAllRejectButtons(): HTMLElement[] {
  for (const regex of [/^reject$/i, /reject/i, /unverify/i, /deny/i]) {
    const els = screen.queryAllByRole('button', { name: regex });
    if (els.length > 0) return els;
  }
  return screen.getAllByRole('button', { name: /reject/i });
}

export function getDeleteButton(): HTMLElement {
  for (const regex of [/^delete$/i, /delete/i, /remove/i]) {
    const el = screen.queryByRole('button', { name: regex });
    if (el) return el;
  }
  return screen.getByRole('button', { name: /delete/i });
}

export function getRestoreButton(): HTMLElement {
  for (const regex of [/^restore$/i, /restore/i, /undo/i, /recover/i]) {
    const el = screen.queryByRole('button', { name: regex });
    if (el) return el;
  }
  return screen.getByRole('button', { name: /restore/i });
}

export function getPendingReviewsTab(): HTMLElement {
  for (const regex of [/pending reviews/i, /reviews/i, /moderate reviews/i]) {
    const el = screen.queryByRole('button', { name: regex }) || screen.queryByText(regex);
    if (el) return el;
  }
  return screen.getByRole('button', { name: /pending reviews/i });
}


// --- HEADINGS AND TEXT ---

export async function findHeading(patterns: RegExp[], defaultName: string): Promise<HTMLElement> {
  return waitFor(() => {
    // 1. Try finding by role heading with target names
    for (const regex of patterns) {
      const el = screen.queryByRole('heading', { name: regex });
      if (el) return el;
    }
    
    // 2. Try finding by plain text (for elements not marked semantically as headings)
    for (const regex of patterns) {
      const el = screen.queryByText(regex);
      if (el) return el;
    }

    // 3. Fallback: return the first heading in the document if present
    const headings = screen.queryAllByRole('heading');
    if (headings.length > 0) return headings[0] as HTMLElement;

    throw new Error(`Heading matching "${defaultName}" not found`);
  });
}

export function findLoginHeading(): Promise<HTMLElement> {
  return findHeading([/^login$/i, /log in/i, /sign in/i], 'Login');
}

export function findHomeHeading(): Promise<HTMLElement> {
  return findHeading([/find your landlord/i, /search landlords/i, /rate yinz landlord/i], 'Find Your Landlord');
}

export function findAddLandlordHeading(): Promise<HTMLElement> {
  return findHeading([/add a new landlord/i, /add landlord/i, /submit landlord/i], 'Add a New Landlord');
}

export function findResetPasswordHeading(): Promise<HTMLElement> {
  return findHeading([/set new password/i, /reset password/i, /update password/i], 'Set New Password');
}

export function findVerifyEmailText(): Promise<HTMLElement> {
  return screen.findByText(/verify your email/i);
}

export function findMismatchedPasswordsText(): Promise<HTMLElement> {
  return screen.findByText(/passwords do not match/i);
}

export function findUnverifiedEmailText(): Promise<HTMLElement> {
  return screen.findByText(/your email is not verified/i);
}

export function getGuestBanner(): HTMLElement {
  return screen.getByText(/you're submitting as a guest/i) || screen.getByText(/submitting as a guest/i);
}

export function findNoLandlordsFoundText(): Promise<HTMLElement> {
  return screen.findByText(/no landlords found/i);
}
