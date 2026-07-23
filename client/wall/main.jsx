import React from 'react';
import ReactDOM from 'react-dom/client';
import WallApp from './WallApp';
import './wall.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WallApp />
  </React.StrictMode>,
);
