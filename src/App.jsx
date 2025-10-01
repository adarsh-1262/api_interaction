import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import UploadPage from './components/uploadPage'
import ChatPage from './components/chatPage'
import CollectionsPage from './components/collectionsPage'
import HealthIndicator from './components/HealthIndicator'

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
        </Routes>
        <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          zIndex: 1000
        }}>
          <HealthIndicator />
        </footer>
    </Router>
  )
}

export default App
