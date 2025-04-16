// Import React so we can use JSX and React components
import React from 'react';

// Import your main application component
import ExamTimerApp from './ExamTimerApp';

// Define the App component which wraps your main ExamTimerApp component in React.StrictMode
// React.StrictMode is a tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants.
function App() {
  return (
    <React.StrictMode>
      <ExamTimerApp />
    </React.StrictMode>
  );
}

// Export the App component as the default export, so it can be imported in index.js or elsewhere
export default App;
