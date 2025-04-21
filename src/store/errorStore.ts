import { create } from 'zustand';
import { ErrorResponse } from '../types';

/**
 * Interface for the global error state
 */
interface ErrorState {
  // Current global error
  currentError: ErrorResponse | null;
  
  // History of errors for debugging
  errorHistory: ErrorResponse[];
  
  // Error visibility state
  isErrorVisible: boolean;
  
  // Actions
  setError: (error: ErrorResponse | null) => void;
  clearError: () => void;
  showError: () => void;
  hideError: () => void;
  addToHistory: (error: ErrorResponse) => void;
  clearHistory: () => void;
}

/**
 * Global store for managing error state
 * Uses Zustand for state management
 */
const useErrorStore = create<ErrorState>((set, get) => ({
  // Initial state
  currentError: null,
  errorHistory: [],
  isErrorVisible: false,
  
  // Set the current error
  setError: (error) => {
    set({ currentError: error, isErrorVisible: Boolean(error) });
    
    // Add to history if it's a new error
    if (error) {
      get().addToHistory(error);
    }
  },
  
  // Clear the current error
  clearError: () => {
    set({ currentError: null, isErrorVisible: false });
  },
  
  // Show the current error
  showError: () => {
    set({ isErrorVisible: true });
  },
  
  // Hide the current error
  hideError: () => {
    set({ isErrorVisible: false });
  },
  
  // Add an error to history
  addToHistory: (error) => {
    set((state) => ({
      errorHistory: [error, ...state.errorHistory].slice(0, 10) // Keep last 10 errors
    }));
  },
  
  // Clear error history
  clearHistory: () => {
    set({ errorHistory: [] });
  }
}));

export default useErrorStore;