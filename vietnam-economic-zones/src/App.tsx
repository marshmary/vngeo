// Remove unused React import as JSX transform handles it
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import QuizPage from './pages/QuizPage';
import QuizListPage from './pages/QuizListPage';
import QuizEditPage from './pages/QuizEditPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import NavBar from './components/common/NavBar';
import Notification from './components/common/Notification';
import { initializeAuth } from './stores/authStore';
import './index.css';

function AppContent() {
  const location = useLocation();
  const showNavBar = location.pathname !== '/login';
  const isMapPage = location.pathname === '/';

  // Prevent body scroll on map page
  useEffect(() => {
    if (isMapPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMapPage]);

  return (
    <>
      {showNavBar && <NavBar />}
      <div className={`gradient-background ${showNavBar && !isMapPage ? 'pt-20' : ''} ${isMapPage ? 'h-screen overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quiz/:quizId/edit"
            element={
              <AdminRoute>
                <QuizEditPage />
              </AdminRoute>
            }
          />
          {/* Future routes will be added here:
              - /zones/:zoneId - Zone detail page
              - /zones/:zoneId/documents - Documents page
              - /zones/:zoneId/qa - Q&A page
          */}
        </Routes>
        <Notification />
      </div>
    </>
  );
}

function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
