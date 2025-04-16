import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Imports Tailwind CSS and any custom global styles
import ExamTimerApp from './ExamTimerApp'; // Imports the main app component

// Render the ExamTimerApp component into the DOM element with an ID of "root"
ReactDOM.render(
  <React.StrictMode>
    <ExamTimerApp />
  </React.StrictMode>,
  document.getElementById('root')
);
