import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// 👉 Enregistrement du service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker enregistré', reg);
      })
      .catch(err => {
        console.error('❌ Erreur Service Worker :', err);
      });
  });
}
