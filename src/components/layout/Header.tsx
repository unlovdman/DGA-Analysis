import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dashboard, 
  Analytics, 
  Upload, 
  Settings, 
  Menu, 
  Close,
  LightMode,
  DarkMode,
  Home
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onBackToHome?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onBackToHome }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Dashboard },
    { id: 'analysis', label: 'Analysis', icon: Analytics }
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isDark 
          ? 'bg-dark-surface/95 backdrop-blur-lg border-dark-border' 
          : 'bg-white/95 backdrop-blur-lg border-gray-200'
      } border-b shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-primary-600' : 'bg-primary-blue'
            } text-white`}>
              <Analytics className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                isDark ? 'text-dark-text' : 'text-gray-900'
              }`}>
                DGA Analysis
              </h1>
              <p className={`text-xs ${
                isDark ? 'text-dark-muted' : 'text-gray-500'
              }`}>
                Dissolved Gas Analysis
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? isDark
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-primary-blue text-white shadow-lg'
                      : isDark
                        ? 'text-dark-text hover:bg-dark-card'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg ${
                        isDark ? 'bg-primary-600' : 'bg-primary-blue'
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Back to Home Button */}
            {onBackToHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToHome}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                } shadow-lg hover:shadow-xl`}
                title="Back to Home"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </motion.button>
            )}

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? 'bg-dark-card text-dark-text hover:bg-dark-border'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <LightMode className="w-5 h-5" />
              ) : (
                <DarkMode className="w-5 h-5" />
              )}
            </motion.button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark
                    ? 'bg-dark-card text-dark-text hover:bg-dark-border'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isMobileMenuOpen ? (
                  <Close className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t ${
              isDark ? 'border-dark-border' : 'border-gray-200'
            }`}
          >
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-blue text-white'
                        : isDark
                          ? 'text-dark-text hover:bg-dark-card'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header; 