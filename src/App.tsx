import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Dashboard from './components/features/Dashboard';
import DuvalAnalysis from './components/features/DuvalAnalysis';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.5
};

function App() {
  const [currentPage, setCurrentPage] = useState('analysis');

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analysis':
        return <DuvalAnalysis />;
      case 'settings':
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">Settings</h2>
              <p className="text-gray-600 dark:text-dark-muted">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="App min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-card transition-colors duration-300">
          <Header onNavigate={handleNavigation} currentPage={currentPage} />
          <main className="pt-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
              >
                {renderCurrentPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
