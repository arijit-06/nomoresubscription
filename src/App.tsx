import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ContentProvider } from './context/ContentContext';
import { useAuth } from './context/AuthContext';
import { useProfile } from './context/ProfileContext';

// Components
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilesPage from './pages/ProfilesPage';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import MyListPage from './pages/MyListPage';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/Layout/LoadingSpinner';

// Styles
import './styles/global.css';

const AppRoutes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/signup" 
        element={!user ? <Signup /> : <Navigate to="/" replace />} 
      />

      {/* Protected routes */}

      
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
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
  );
};

const App: React.FC = () => {
  return (
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
  );
};

export default App;