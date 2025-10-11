// Remove unused React import as JSX transform handles it
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import QuizPage from './pages/QuizPage';
import QuizListPage from './pages/QuizListPage';
import QuizEditPage from './pages/QuizEditPage';
import MapDrawingPage from './pages/MapDrawingPage';
import FeedbackPage from './pages/FeedbackPage';
import AdminRoute from './components/auth/AdminRoute';
import Sidebar from './components/common/Sidebar';
import Notification from './components/common/Notification';
import { initializeAuth } from './stores/authStore';
import './index.css';

function AppContent() {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';
  const isMapPage = location.pathname === '/';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      {showSidebar && <Sidebar onCollapsedChange={setSidebarCollapsed} />}
      <div
        className={`gradient-background transition-all duration-300 ${isMapPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
        style={{
          marginLeft: showSidebar && window.innerWidth >= 1024 ? (sidebarCollapsed ? '5rem' : '18rem') : '0',
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/map-drawing" element={<MapDrawingPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
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
