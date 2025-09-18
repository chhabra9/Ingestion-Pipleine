// React imports for creating the root and enabling strict mode
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global styles and main App component
import './index.css'
import App from './App.jsx'

// Create React root and render the App component
// StrictMode helps identify potential problems in development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
