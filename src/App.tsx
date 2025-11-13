import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ContentProvider } from './context/ContentContext';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/Layout/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Initialize environment validation
import './utils/env';

// Lazy load components for code splitting
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ProfilesPage = lazy(() => import('./pages/ProfilesPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const MyListPage = lazy(() => import('./pages/MyListPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const TVSelectPage = lazy(() => import('./pages/TVSelectPage'));

// Styles
import './styles/global.css';

const AppRoutes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!user ? (
            <ErrorBoundary>
              <Login />
            </ErrorBoundary>
          ) : <Navigate to="/" replace />} 
        />
        <Route 
          path="/signup" 
          element={!user ? (
            <ErrorBoundary>
              <Signup />
            </ErrorBoundary>
          ) : <Navigate to="/" replace />} 
        />

      {/* Protected routes */}

      
        <Route path="/" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <HomePage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
      
      <Route path="/browse/:category" element={
        <ProtectedRoute>
          <BrowsePage />
        </ProtectedRoute>
      } />
      
      <Route path="/my-list" element={
        <ProtectedRoute>
          <MyListPage />
        </ProtectedRoute>
      } />
      
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      } />
      
      <Route path="/tv/:id" element={
        <ProtectedRoute>
          <TVSelectPage />
        </ProtectedRoute>
      } />
      
      <Route path="/watch/:type/:id" element={
        <ProtectedRoute>
          <WatchPage />
        </ProtectedRoute>
      } />

      <Route path="/watch/:type/:id/:season/:episode" element={
        <ProtectedRoute>
          <WatchPage />
        </ProtectedRoute>
      } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ProfileProvider>
            <ContentProvider>
              <div className="App">
                <AppRoutes />
              </div>
            </ContentProvider>
          </ProfileProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;