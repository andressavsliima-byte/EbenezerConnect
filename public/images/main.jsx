import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Prevent mobile viewport height changes from causing layout shift
function setVhCssVariable() {
  try {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  } catch {}
}

setVhCssVariable();
window.addEventListener('resize', setVhCssVariable, { passive: true });
window.addEventListener('orientationchange', setVhCssVariable, { passive: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
