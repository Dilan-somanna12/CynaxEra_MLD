import React from 'react';
import { createRoot } from 'react-dom/client';
import './Popup.css';
import Popup from './Popup.jsx';
import History from './history.jsx';

const root = createRoot(document.getElementById('root'));

if (window.location.pathname.endsWith('history.html')) {
  root.render(
    <React.StrictMode>
      <History />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
} 