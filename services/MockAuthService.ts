import type { IAuthService } from './interfaces';

export class MockAuthService implements IAuthService {
  async getSession() {
    return null;
  }

  onAuthStateChange(_callback: (user: { id: string; email: string } | null) => void) {
    return { unsubscribe: () => {} };
  }

  async signIn(_email: string, _password: string) {
    return { success: false, error: 'Authentication is not available in demo mode.' };
  }

  async signUp(_email: string, _password: string, _options: { redirectTo: string }) {
    return { success: false, error: 'Registration is not available in demo mode.' };
  }

  async signOut() {}

  async resetPassword(_email: string, _options: { redirectTo: string }) {
    return { success: false, error: 'Password reset is not available in demo mode.' };
  }

  async updatePassword(_password: string) {
    return { success: false, error: 'Password update is not available in demo mode.' };
  }

  async verifyOtp(_params: {
    tokenHash: string;
    type: 'recovery' | 'signup' | 'invite' | 'email' | 'email_change';
  }) {
    return { error: 'Email verification is not available in demo mode.' };
  }

  async exchangeCodeForSession(_code: string) {
    return { error: 'Email verification is not available in demo mode.' };
  }

  async checkIsAdmin(_email: string) {
    return false;
  }
}
