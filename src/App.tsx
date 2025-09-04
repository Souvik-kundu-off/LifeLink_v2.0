import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HospitalRegistration from './components/HospitalRegistration';
import IndividualRegistration from './components/IndividualRegistration';
import AdminLogin from './components/AdminLogin';
import LoadingScreen from './components/LoadingScreen';
import HospitalDashboard from './components/HospitalDashboard';
import AdminDashboard from './components/AdminDashboard';
import DonorRecipientApp from './components/DonorRecipientApp';
import { AuthProvider, useAuth } from './components/AuthWrapper';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import { User, UserRole } from './types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Wrapper component to handle navigation
function AuthRoutes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = (userData: User) => {
    // User state is managed by AuthProvider
    navigate(getDashboardRoute(userData.role));
  };

  return (
    <Routes>
      {/* Landing and Authentication Routes */}
      <Route 
        path="landing" 
        element={
          user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <LandingPage onSelectUserType={(type) => {
              if (type === 'hospital') {
                navigate('/auth/hospital');
              } else if (type === 'admin') {
                navigate('/auth/admin');
              } else {
                navigate('/auth/individual');
              }
            }} />
          )
        } 
      />
      
      <Route 
        path="hospital" 
        element={
          user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <HospitalRegistration 
              onLogin={handleLogin} 
              onBack={() => navigate('/auth/landing')}
            />
          )
        } 
      />
      
      <Route 
        path="individual" 
        element={
          user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <IndividualRegistration 
              onLogin={handleLogin} 
              onBack={() => navigate('/auth/landing')}
            />
          )
        } 
      />
      
      <Route 
        path="admin" 
        element={
          user ? (
            <Navigate to={getDashboardRoute(user.role)} replace />
          ) : (
            <AdminLogin 
              onLogin={handleLogin} 
              onBack={() => navigate('/auth/landing')}
            />
          )
        } 
      />
    </Routes>
  );
}

function AppContent() {
  const { user, loading, error, signOut, clearError } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="space-y-3">
                <p>{error}</p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearError}
                  >
                    Continue Anyway
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Authentication Routes */}
        <Route 
          path="/auth/*" 
          element={<AuthRoutes />} 
        />

        {/* Application Routes */}
        <Route 
          path="/hospital/*" 
          element={
            user && user.role === 'hospital_staff' ? (
              <HospitalDashboard user={user} onLogout={signOut} />
            ) : (
              <Navigate to="/auth/landing" replace />
            )
          } 
        />

        <Route 
          path="/admin/*" 
          element={
            user && user.role === 'admin' ? (
              <AdminDashboard user={user} onLogout={signOut} />
            ) : (
              <Navigate to="/auth/landing" replace />
            )
          } 
        />
        
        <Route 
          path="/individual/*" 
          element={
            user && user.role === 'individual' ? (
              <DonorRecipientApp user={user} onLogout={signOut} />
            ) : (
              <Navigate to="/auth/landing" replace />
            )
          } 
        />
        
        {/* Legacy routes for backward compatibility */}
        <Route 
          path="/login" 
          element={<Navigate to="/auth/landing" replace />} 
        />
        
        <Route 
          path="/donor/*" 
          element={<Navigate to="/individual" replace />} 
        />
        
        <Route 
          path="/recipient/*" 
          element={<Navigate to="/individual" replace />} 
        />
        
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={getDashboardRoute(user.role)} replace />
            ) : (
              <Navigate to="/auth/landing" replace />
            )
          } 
        />

        {/* Catch-all route for unmatched paths */}
        <Route 
          path="*" 
          element={
            user ? (
              <Navigate to={getDashboardRoute(user.role)} replace />
            ) : (
              <Navigate to="/auth/landing" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'hospital_staff':
      return '/hospital';
    case 'individual':
      return '/individual';
    case 'admin':
      return '/admin'; // Admins get their own dashboard
    default:
      return '/auth/landing';
  }
}

export default App;