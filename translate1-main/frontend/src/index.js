import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Используйте App-complex для версии с Tailwind CSS или App для простой версии
import App from './App-complex';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);