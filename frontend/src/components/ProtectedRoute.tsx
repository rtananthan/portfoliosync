import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  fallback 
}) => {
  const { authState, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is not required, always show children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is authenticated, show children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If custom fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default authentication required screen
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Secure Access Required
            </h2>
            <p className="text-gray-600">
              Please sign in to access your investment portfolio and financial data.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In to Continue
            </button>

            <div className="border-t pt-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                <span>Your data is protected with bank-level security</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>
              This application uses AWS Cognito for secure authentication and follows
              financial industry security standards.
            </p>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </>
  );
};

// HOC version for easier use
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true
) => {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute requireAuth={requireAuth}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
};