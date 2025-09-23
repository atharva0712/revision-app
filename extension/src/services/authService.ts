const TOKEN_KEY = 'jwtToken';

export const authService = {
  async getToken(): Promise<string | null> {
    const result = await chrome.storage.local.get(TOKEN_KEY);
    return result[TOKEN_KEY] || null;
  },

  async setToken(token: string): Promise<void> {
    await chrome.storage.local.set({ [TOKEN_KEY]: token });
  },

  async removeToken(): Promise<void> {
    await chrome.storage.local.remove(TOKEN_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    // Basic check: token exists. More robust check would involve validating token expiry.
    return !!token;
  },

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        await this.setToken(data.token);
        return { success: true, token: data.token };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error during login' };
    }
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        await this.setToken(data.token);
        return { success: true, token: data.token };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error during registration' };
    }
  },

  async logout(): Promise<void> {
    await this.removeToken();
  },
};
