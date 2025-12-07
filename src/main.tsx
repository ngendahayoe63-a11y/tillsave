import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    }).then(reg => {
      console.log('✅ Service Worker registered:', reg);
      // Check for updates every hour
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);
    }).catch(err => {
      // Note: MIME type errors in dev mode are expected (Vite doesn't serve sw.js)
      // Service Worker will work fine in production
      if (err.name === 'SecurityError' && import.meta.env.DEV) {
        console.log('ℹ️ Service Worker: Dev mode - SW will be available in production');
      } else {
        console.warn('⚠️ Service Worker registration issue:', err);
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
