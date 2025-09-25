const TOKEN_KEY = 'jwtToken';
const TOKEN_EXPIRY_KEY = 'jwtTokenExpiry';

// Helper to decode JWT and get expiry
const getTokenExpiry = (token: string): number | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

export const enhancedAuthService = {
  async getToken(): Promise<string | null> {
    const result = await chrome.storage.local.get(TOKEN_KEY);
    return result[TOKEN_KEY] || null;
  },

  async setToken(token: string): Promise<void> {
    const expiry = getTokenExpiry(token);
    await chrome.storage.local.set({ 
      [TOKEN_KEY]: token,
      [TOKEN_EXPIRY_KEY]: expiry 
    });
  },

  async removeToken(): Promise<void> {
    await chrome.storage.local.remove([TOKEN_KEY, TOKEN_EXPIRY_KEY]);
  },

  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    const result = await chrome.storage.local.get(TOKEN_EXPIRY_KEY);
    const expiry = result[TOKEN_EXPIRY_KEY];
    
    if (!expiry) return false;
    
    // Check if token expires in next 5 minutes (buffer)
    return Date.now() < (expiry - 5 * 60 * 1000);
  },

  async isAuthenticated(): Promise<boolean> {
    return await this.isTokenValid();
  },

  // Enhanced API call wrapper with auto-logout on 401
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();
    if (!token || !(await this.isTokenValid())) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        ...options.headers,
      },
    });

    // Handle expired token
    if (response.status === 401) {
      await this.removeToken();
      throw new Error('TOKEN_EXPIRED');
    }

    return response;
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

  // Get time until token expires (for UI display)
  async getTimeUntilExpiry(): Promise<number | null> {
    const result = await chrome.storage.local.get(TOKEN_EXPIRY_KEY);
    const expiry = result[TOKEN_EXPIRY_KEY];
    
    if (!expiry) return null;
    
    const timeLeft = expiry - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  }
};