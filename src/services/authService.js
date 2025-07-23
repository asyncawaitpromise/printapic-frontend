import PocketBase from 'pocketbase';

class AuthService {
  constructor() {
    this.pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090');
    this.pb.autoCancellation(false);
  }

  // Get current user
  get currentUser() {
    return this.pb.authStore.model;
  }

  // Check if user is authenticated
  get isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  // Get auth token
  get token() {
    return this.pb.authStore.token;
  }

  // Sign up with email and password
  async signUp(email, password, passwordConfirm, userData = {}) {
    try {
      const data = {
        email,
        password,
        passwordConfirm,
        ...userData
      };
      
      const record = await this.pb.collection('users').create(data);
      
      // Send verification email if needed
      await this.pb.collection('users').requestVerification(email);
      
      return { success: true, user: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const authData = await this.pb.collection('users').authWithPassword(email, password);
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign out
  signOut() {
    this.pb.authStore.clear();
  }

  // Refresh authentication
  async refresh() {
    try {
      if (this.pb.authStore.isValid) {
        await this.pb.collection('users').authRefresh();
        return true;
      }
      return false;
    } catch (error) {
      this.pb.authStore.clear();
      return false;
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      await this.pb.collection('users').requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Confirm password reset
  async confirmPasswordReset(token, password, passwordConfirm) {
    try {
      await this.pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateProfile(data) {
    try {
      const record = await this.pb.collection('users').update(this.currentUser.id, data);
      return { success: true, user: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Listen for auth changes
  onAuthChange(callback) {
    return this.pb.authStore.onChange((token, model) => {
      callback(token, model);
    });
  }

  // OAuth with Google
  async signInWithGoogle() {
    try {
      const authData = await this.pb.collection('users').authWithOAuth2({ provider: 'google' });
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // OAuth with GitHub
  async signInWithGitHub() {
    try {
      const authData = await this.pb.collection('users').authWithOAuth2({ provider: 'github' });
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // OAuth with Discord
  async signInWithDiscord() {
    try {
      const authData = await this.pb.collection('users').authWithOAuth2({ provider: 'discord' });
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Generic OAuth method
  async signInWithOAuth(provider) {
    try {
      const authData = await this.pb.collection('users').authWithOAuth2({ provider });
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get PocketBase instance for direct access
  getPB() {
    return this.pb;
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;