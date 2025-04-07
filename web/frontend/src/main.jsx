import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// React 17 rendering - no need for createRoot
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);