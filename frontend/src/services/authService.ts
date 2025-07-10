import { mockAuthService } from './mockAuthService';

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

export interface SocialLoginProvider {
  name: string;
  provider: 'Google' | 'Facebook';
  icon: string;
  color: string;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  };
  
  private listeners: Array<(authState: AuthState) => void> = [];
  // private cognitoConfig: any = null;

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      console.log('Auth service initializing...');
      
      // Set loading to false immediately
      this.authState.loading = false;
      
      // Check if authentication is enabled
      const authEnabled = (import.meta as any).env.VITE_AUTH_ENABLED !== 'false';
      
      if (!authEnabled) {
        console.log('Authentication disabled - using mock user');
        this.authState = {
          isAuthenticated: true,
          user: {
            cognitoId: 'dev-user-123',
            email: 'dev@example.com',
            givenName: 'Dev',
            familyName: 'User',
            userId: 'dev-user-123',
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
              defaultPortfolioName: 'Dev Portfolio',
              riskTolerance: 'moderate',
              investmentGoals: []
            }
          },
          token: 'dev-token',
          loading: false,
          error: null
        };
        this.notifyListeners();
        return;
      }

      // Check if we have Cognito configuration
      const hasCogitoConfig = (import.meta as any).env.VITE_COGNITO_USER_POOL_ID && 
                             (import.meta as any).env.VITE_COGNITO_CLIENT_ID &&
                             (import.meta as any).env.VITE_COGNITO_USER_POOL_ID !== 'pending';

      if (!hasCogitoConfig) {
        console.log('Cognito not configured - using mock authentication for testing');
        // Delegate to mock auth service
        const mockState = mockAuthService.getAuthState();
        this.authState = { ...mockState, loading: false }; // Ensure loading is false
        
        // Subscribe to mock auth state changes
        mockAuthService.subscribe((newState) => {
          this.authState = { ...newState, loading: false }; // Ensure loading stays false
          this.notifyListeners();
        });
        
        this.notifyListeners();
        return;
      }

      // If we reach here, we should configure AWS Amplify (not implemented yet)
      console.warn('AWS Cognito configuration detected but Amplify setup not complete');
      
      // For now, fall back to mock auth
      const mockState = mockAuthService.getAuthState();
      this.authState = { ...mockState, loading: false };
      
      mockAuthService.subscribe((newState) => {
        this.authState = { ...newState, loading: false };
        this.notifyListeners();
      });
      
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

  // private async checkAuthState(): Promise<void> {
  //   // Not used in mock implementation
  // }

  // private async getUserProfile(token: string): Promise<User> {
  //   // Not used in mock implementation
  // }

  async signUp(credentials: SignUpCredentials): Promise<void> {
    // Delegate to mock service for now
    const authEnabled = (import.meta as any).env.VITE_AUTH_ENABLED !== 'false';
    const hasCogitoConfig = (import.meta as any).env.VITE_COGNITO_USER_POOL_ID && 
                           (import.meta as any).env.VITE_COGNITO_CLIENT_ID &&
                           (import.meta as any).env.VITE_COGNITO_USER_POOL_ID !== 'pending';

    if (!authEnabled || !hasCogitoConfig) {
      return mockAuthService.signUp(credentials);
    }

    // TODO: Implement Cognito sign up when configuration is ready
    throw new Error('Cognito authentication not yet implemented');
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    return mockAuthService.confirmSignUp(email, code);
  }

  async signIn(credentials: LoginCredentials): Promise<void> {
    // Delegate to mock service for now
    const authEnabled = (import.meta as any).env.VITE_AUTH_ENABLED !== 'false';
    const hasCogitoConfig = (import.meta as any).env.VITE_COGNITO_USER_POOL_ID && 
                           (import.meta as any).env.VITE_COGNITO_CLIENT_ID &&
                           (import.meta as any).env.VITE_COGNITO_USER_POOL_ID !== 'pending';

    if (!authEnabled || !hasCogitoConfig) {
      return mockAuthService.signIn(credentials);
    }

    // TODO: Implement Cognito sign in when configuration is ready
    throw new Error('Cognito authentication not yet implemented');
  }

  async signInWithSocial(provider: 'Google' | 'Facebook'): Promise<void> {
    return mockAuthService.signInWithSocial(provider);
  }

  async signOut(): Promise<void> {
    return mockAuthService.signOut();
  }

  async forgotPassword(email: string): Promise<void> {
    return mockAuthService.forgotPassword(email);
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    return mockAuthService.confirmForgotPassword(email, code, newPassword);
  }

  // private async createUserProfile(token: string): Promise<void> {
  //   // Not used in mock implementation
  // }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    return mockAuthService.updateUserProfile(updates);
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

  getSocialProviders(): SocialLoginProvider[] {
    return [
      {
        name: 'Google',
        provider: 'Google',
        icon: 'google',
        color: 'bg-red-500 hover:bg-red-600'
      },
      {
        name: 'Facebook',
        provider: 'Facebook',
        icon: 'facebook',
        color: 'bg-blue-600 hover:bg-blue-700'
      }
    ];
  }

  // Security utilities
  async refreshToken(): Promise<string> {
    return mockAuthService.refreshToken();
  }

  isAuthEnabled(): boolean {
    return (import.meta as any).env.VITE_AUTH_ENABLED !== 'false';
  }
}

export const authService = AuthService.getInstance();