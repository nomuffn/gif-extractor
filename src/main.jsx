import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Set the document title
document.title = 'GIF Extractor - Extract Frames from GIFs';

// Handle routing for GitHub Pages
if (typeof window !== 'undefined') {
  // Check if we're on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    // Add base path to all relative links
    const base = '/gif-extractor';
    const originalPushState = window.history.pushState;
    window.history.pushState = function(state, title, url) {
      if (url && url.startsWith('/')) {
        arguments[2] = base + url;
      }
      return originalPushState.apply(this, arguments);
    };
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
