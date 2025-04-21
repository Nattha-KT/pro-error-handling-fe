import React from 'react';
import ErrorBoundary from './errors/boundaries/ErrorBoundary';
import ErrorDemo from './pages/ErrorDemo';
import ToastContainer from './components/ui/ToastContainer';
import { ShieldAlert } from 'lucide-react';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-slate-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
            <ShieldAlert className="h-8 w-8 text-yellow-400 mr-3" />
            <h1 className="text-xl font-bold">Error Handling Pro Patterns</h1>
          </div>
        </header>

        <main>
          <ErrorDemo />
        </main>

        <footer className="bg-slate-800 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-300">
              Pro Error Handling Patterns Demo - Built with React & TypeScript
            </p>
          </div>
        </footer>

        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;