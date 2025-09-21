import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Notification from './components/common/Notification';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
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
