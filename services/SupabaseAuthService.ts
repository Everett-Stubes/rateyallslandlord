import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { IAuthService } from './interfaces';

// A session only counts as logged in once the person has confirmed their email. Supabase normally
// refuses to sign in an unconfirmed account (Authentication -> Sign In / Providers -> Email ->
// "Confirm email"); this is a second check in case that setting is ever loosened.
const isConfirmed = (user: User | null | undefined): user is User => Boolean(user?.email_confirmed_at);

export class SupabaseAuthService implements IAuthService {
  constructor(private client: SupabaseClient) {}

  async getSession() {
    const {
      data: { session },
    } = await this.client.auth.getSession();
    if (!isConfirmed(session?.user)) return null;
    return { id: session.user.id, email: session.user.email! };
  }

  onAuthStateChange(callback: (user: { id: string; email: string } | null) => void) {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((_event, session) => {
      if (isConfirmed(session?.user)) {
        callback({ id: session.user.id, email: session.user.email! });
      } else {
        callback(null);
      }
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  }

  // captchaToken is the Turnstile token from the page. When CAPTCHA protection is
  // turned on in Supabase (Authentication → Attack Protection), Supabase checks it
  // with Cloudflare on its server and rejects the request if it is missing or fake.
  async signIn(email: string, password: string, captchaToken?: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      const message = error.message.toLowerCase();
      const code = ((error as unknown as { code?: string }).code ?? '').toLowerCase();
      const isUnverifiedEmail =
        code === 'email_not_confirmed' ||
        message.includes('email not confirmed') ||
        message.includes('email confirmation');

      if (isUnverifiedEmail) {
        return {
          success: false,
          error: 'Your email is not verified yet. Please verify your email and try again.',
          emailNotVerified: true,
        };
      }
      return { success: false, error: 'Invalid email or password.' };
    }

    if (data.user && !isConfirmed(data.user)) {
      await this.client.auth.signOut();
      return {
        success: false,
        error: 'Your email is not verified yet. Please verify your email and try again.',
        emailNotVerified: true,
      };
    }

    if (data.user) {
      return { success: true, user: { id: data.user.id, email: data.user.email! } };
    }

    return { success: false, error: 'Invalid email or password.' };
  }

  async signUp(email: string, password: string, options: { redirectTo: string; captchaToken?: string; data?: Record<string, unknown> }) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: options.redirectTo, captchaToken: options.captchaToken, data: options.data },
    });

    if (error) return { success: false, error: error.message };
    return { success: !!data.user };
  }

  async signOut() {
    await this.client.auth.signOut();
  }

  async resetPassword(email: string, options: { redirectTo: string; captchaToken?: string }) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: options.redirectTo,
      captchaToken: options.captchaToken,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async resendVerification(email: string, options: { redirectTo: string; captchaToken?: string }) {
    const { error } = await this.client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: options.redirectTo, captchaToken: options.captchaToken },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async updatePassword(password: string) {
    const { error } = await this.client.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async verifyOtp(params: {
    tokenHash: string;
    type: 'recovery' | 'signup' | 'invite' | 'email' | 'email_change';
  }) {
    const { error } = await this.client.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: params.type,
    });
    return { error: error?.message };
  }

  async exchangeCodeForSession(code: string) {
    const { error } = await this.client.auth.exchangeCodeForSession(code);
    return { error: error?.message };
  }

  async checkIsAdmin(email: string) {
    try {
      const { data, error } = await this.client
        .from('admins')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      return !error && !!data;
    } catch {
      return false;
    }
  }
}
