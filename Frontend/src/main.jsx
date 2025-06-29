import React from 'react';
import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './styles/globals.css';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
