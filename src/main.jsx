// non firebase code
//------------------------
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from "./pages/App";
// // import RootApp from './App'; // Import the RootApp component

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// )

// Firebase flow//-------------------------\


import React from 'react';
import ReactDOM from 'react-dom/client';
import RootApp from './App'; // Import the RootApp component
import './index.css'

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // Create a root

root.render(
  <React.StrictMode>
    <RootApp /> {/* Render the RootApp wrapped in AuthProvider */}
  </React.StrictMode>
);
