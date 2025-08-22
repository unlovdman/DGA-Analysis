import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Dashboard from './components/features/Dashboard';
import BreakdownVoltageDashboard from './components/features/BreakdownVoltageDashboard';
import DuvalAnalysis from './components/features/DuvalAnalysis';
import BreakdownVoltageAnalysis from './components/features/BreakdownVoltageAnalysis';
import LandingPage from './components/features/LandingPage';

type AnalysisType = 'dga' | 'breakdown' | null;
type AppView = 'landing' | 'dashboard' | 'analysis';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [analysisType, setAnalysisType] = useState<AnalysisType>(null);

  const handleSelectAnalysis = (type: AnalysisType) => {
    setAnalysisType(type);
    setCurrentView('analysis');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setAnalysisType(null);
  };

  const handleGoToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleStartNewAnalysis = () => {
    setCurrentView('analysis');
  };

  const handleViewHistory = () => {
    // This could open a history modal or navigate to a history page
    // For now, we'll just stay on dashboard as history modals are handled internally
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onSelectAnalysis={handleSelectAnalysis} />;
      
      case 'dashboard':
        // Show appropriate dashboard based on current analysis type
        if (analysisType === 'breakdown') {
          return (
            <div className="min-h-screen">
              <Header 
                onNavigate={(tab) => {
                  if (tab === 'dashboard') setCurrentView('dashboard');
                  else if (tab === 'analysis') setCurrentView('analysis');
                }}
                currentPage="dashboard"
                onBackToHome={handleBackToLanding}
              />
              <BreakdownVoltageDashboard 
                onStartAnalysis={handleStartNewAnalysis}
                onViewHistory={handleViewHistory}
              />
            </div>
          );
        } else {
          // Default to DGA Dashboard
          return (
            <div className="min-h-screen">
              <Header 
                onNavigate={(tab) => {
                  if (tab === 'dashboard') setCurrentView('dashboard');
                  else if (tab === 'analysis') handleSelectAnalysis('dga');
                }}
                currentPage="dashboard"
                onBackToHome={handleBackToLanding}
              />
              <Dashboard 
                onStartAnalysis={() => handleSelectAnalysis('dga')}
                onViewHistory={handleViewHistory}
              />
            </div>
          );
        }
      
      case 'analysis':
        if (analysisType === 'dga') {
          return (
            <div className="min-h-screen">
              <Header 
                onNavigate={(tab) => {
                  if (tab === 'dashboard') setCurrentView('dashboard');
                  else if (tab === 'analysis') setCurrentView('analysis');
                }}
                currentPage="analysis"
                onBackToHome={handleBackToLanding}
              />
              <DuvalAnalysis onBack={handleBackToLanding} />
            </div>
          );
        } else if (analysisType === 'breakdown') {
          return (
            <div className="min-h-screen">
              <Header 
                onNavigate={(tab) => {
                  if (tab === 'dashboard') setCurrentView('dashboard');
                  else if (tab === 'analysis') setCurrentView('analysis');
                }}
                currentPage="analysis"
                onBackToHome={handleBackToLanding}
              />
              <BreakdownVoltageAnalysis onBack={handleBackToLanding} />
            </div>
          );
        }
        return <LandingPage onSelectAnalysis={handleSelectAnalysis} />;
      
      default:
        return <LandingPage onSelectAnalysis={handleSelectAnalysis} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="App">
        {renderCurrentView()}
      </div>
    </ThemeProvider>
  );
}

export default App;
