// Remove unused React import as JSX transform handles it
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import Notification from './components/common/Notification';
import './index.css';

function App() {
  return (
    <Router>
      <div className="gradient-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          {/* Future routes will be added here:
              - /zones/:zoneId - Zone detail page
              - /zones/:zoneId/documents - Documents page
              - /zones/:zoneId/qa - Q&A page
              - /admin - Admin dashboard
          */}
        </Routes>
        <Notification />
      </div>
    </Router>
  );
}

export default App;
