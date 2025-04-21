import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorManager from './errors/ErrorManager';
import { logErrorToMonitoring } from './services/errorLogging';
import { setUserContext } from './services/errorLogging';
import useErrorStore from './store/errorStore';

// Set up global error handlers for unhandled errors
window.onerror = (message, source, lineno, colno, error) => {
  const processedError = ErrorManager.handle(error || message);
  
  // Log to monitoring service
  logErrorToMonitoring(processedError, {
    source,
    line: lineno,
    column: colno,
    type: 'window.onerror'
  });
  
  // Add to global error state
  const setError = useErrorStore.getState().setError;
  setError(processedError);
  
  // Prevent default handling
  return true;
};

// Handle unhandled promise rejections
window.onunhandledrejection = (event) => {
  const processedError = ErrorManager.handle(event.reason);
  
  // Log to monitoring service
  logErrorToMonitoring(processedError, {
    type: 'unhandledRejection'
  });
  
  // Add to global error state
  const setError = useErrorStore.getState().setError;
  setError(processedError);
};

// Simulate setting user context for error reporting
setUserContext('demo-user-123', {
  role: 'admin',
  email: 'demo@example.com'
});

// Render the application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);