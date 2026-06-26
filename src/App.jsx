import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './app/store';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          {/* Main App Navigation Routes */}
          <AppRoutes />
          
          {/* Toast Notification Container */}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-800 text-sm font-medium rounded-xl',
              duration: 3500,
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
