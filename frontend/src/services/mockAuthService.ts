// Mock Authentication Service for Testing
// This provides a simplified authentication system for immediate testing

export interface User {
  cognitoId: string;
  email: string;
  givenName: string;
  familyName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  preferences: {
    currency: string;
    timezone: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  portfolioSettings: {
    defaultPortfolioName: string;
    riskTolerance: string;
    investmentGoals: string[];
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}

// Mock user database
const mockUsers = new Map<string, {
  password: string;
  user: User;
}>();

// Mock session storage (for future use)
// let currentUser: User | null = null;
// let currentToken: string | null = null;

class MockAuthService {
  private static instance: MockAuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  };
  
  private listeners: Array<(authState: AuthState) => void> = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      console.log('Mock auth service initializing...');
      
      // Set loading to false immediately to prevent infinite loading
      this.authState.loading = false;
      
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        console.log('Found stored user, restoring session...');
        this.authState = {
          isAuthenticated: true,
          user: JSON.parse(storedUser),
          token: storedToken,
          loading: false,
          error: null
        };
      } else {
        console.log('No stored user found, showing login screen...');
        this.authState = {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null
        };
      }
      
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Failed to initialize authentication'
      };
      this.notifyListeners();
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<void> {
    try {
      this.authState.loading = true;
      this.authState.error = null;
      this.notifyListeners();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      if (mockUsers.has(credentials.email)) {
        throw new Error('User already exists');
      }

      // Create new user
      const userId = `user_${Date.now()}`;
      const newUser: User = {
        cognitoId: userId,
        email: credentials.email,
        givenName: credentials.givenName,
        familyName: credentials.familyName,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        preferences: {
          currency: 'AUD',
          timezone: 'Australia/Sydney',
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            sms: false
          }
        },
        portfolioSettings: {
          defaultPortfolioName: `${credentials.givenName} Portfolio`,
          riskTolerance: 'moderate',
          investmentGoals: []
        }
      };

      // Store user in mock database
      mockUsers.set(credentials.email, {
        password: credentials.password,
        user: newUser
      });

      console.log('Mock user created successfully:', credentials.email);
      
      this.authState.loading = false;
      this.notifyListeners();

    } catch (error: any) {
      this.authState.error = error.message || 'Sign up failed';
      this.authState.loading = false;
      this.notifyListeners();
      throw error;
    }
  }

  async signIn(credentials: LoginCredentials): Promise<void> {
    try {
      this.authState.loading = true;
      this.authState.error = null;
      this.notifyListeners();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check credentials
      const userRecord = mockUsers.get(credentials.email);
      if (!userRecord || userRecord.password !== credentials.password) {
        throw new Error('Invalid email or password');
      }

      // Generate mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set authenticated state
      this.authState = {
        isAuthenticated: true,
        user: userRecord.user,
        token: token,
        loading: false,
        error: null
      };

      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(userRecord.user));
      localStorage.setItem('auth_token', token);

      // currentUser = userRecord.user;
      // currentToken = token;
      
      this.notifyListeners();

    } catch (error: any) {
      this.authState.error = error.message || 'Sign in failed';
      this.authState.loading = false;
      this.notifyListeners();
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      this.authState.loading = true;
      this.notifyListeners();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear state
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };

      // Clear localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');

      // currentUser = null;
      // currentToken = null;
      
      this.notifyListeners();

    } catch (error: any) {
      console.error('Sign out failed:', error);
      this.authState.error = error.message || 'Sign out failed';
      this.authState.loading = false;
      this.notifyListeners();
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      if (!this.authState.user || !this.authState.token) {
        throw new Error('Not authenticated');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update user
      const updatedUser = {
        ...this.authState.user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update mock database
      const userRecord = mockUsers.get(this.authState.user.email);
      if (userRecord) {
        userRecord.user = updatedUser;
        mockUsers.set(this.authState.user.email, userRecord);
      }

      // Update state
      this.authState.user = updatedUser;
      
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      this.notifyListeners();
      
      return updatedUser;

    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getUser(): User | null {
    return this.authState.user;
  }

  getToken(): string | null {
    return this.authState.token;
  }

  subscribe(listener: (authState: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Mock implementations for compatibility
  async confirmSignUp(_email: string, _code: string): Promise<void> {
    console.log('Mock: Email confirmation not required for mock auth');
  }

  async signInWithSocial(_provider: 'Google' | 'Facebook'): Promise<void> {
    throw new Error('Social login not available in mock mode');
  }

  async forgotPassword(_email: string): Promise<void> {
    console.log('Mock: Password reset email sent (mock)');
  }

  async confirmForgotPassword(_email: string, _code: string, _newPassword: string): Promise<void> {
    console.log('Mock: Password reset successful (mock)');
  }

  async refreshToken(): Promise<string> {
    if (!this.authState.token) {
      throw new Error('No token to refresh');
    }
    // Return existing token in mock mode
    return this.authState.token;
  }

  getSocialProviders() {
    return []; // No social providers in mock mode
  }

  isAuthEnabled(): boolean {
    return true; // Always enabled in mock mode
  }
}

export const mockAuthService = MockAuthService.getInstance();