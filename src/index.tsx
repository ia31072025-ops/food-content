import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx'; // Здесь не нужно писать .tsx, React поймет сам
import reportWebVitals from './reportWebVitals';

// Указываем TS, что элемент точно существует через "as HTMLElement"
const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();