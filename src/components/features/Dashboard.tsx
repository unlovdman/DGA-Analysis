import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  Timeline,
  Analytics,
  History,
  GetApp,
  DateRange,
  Science,
  Error as ErrorIcon,
  Lightbulb
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import HistoryModal from './HistoryModal';
import type { AnalysisHistory, ManualTriangleData } from '../../types';

interface DashboardStats {
  totalAnalyses: number;
  completedAnalyses: number;
  exportedAnalyses: number;
  criticalFaults: number;
  highFaults: number;
  mediumFaults: number;
  lowFaults: number;
  recentAnalyses: AnalysisHistory[];
  triangleDistribution: { triangle1: number; triangle4: number; triangle5: number };
  faultDistribution: Record<string, number>;
  monthlyTrend: { month: string; count: number }[];
}

interface DashboardProps {
  onStartAnalysis?: () => void;
  onViewHistory?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartAnalysis, onViewHistory }) => {
  const { isDark } = useTheme();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    completedAnalyses: 0,
    exportedAnalyses: 0,
    criticalFaults: 0,
    highFaults: 0,
    mediumFaults: 0,
    lowFaults: 0,
    recentAnalyses: [],
    triangleDistribution: { triangle1: 0, triangle4: 0, triangle5: 0 },
    faultDistribution: {},
    monthlyTrend: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLoadHistory = (history: AnalysisHistory) => {
    setShowHistoryModal(false);
    if (onViewHistory) {
      onViewHistory();
    }
    // You might want to pass the loaded history to a parent component
    // or navigate to the analysis page with pre-loaded data
  };

  const loadDashboardData = () => {
    try {
      const saved = localStorage.getItem('dgaAnalysisHistory');
      if (saved) {
        const historyData: AnalysisHistory[] = JSON.parse(saved).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          exportedAt: item.exportedAt ? new Date(item.exportedAt) : undefined
        }));

        // Calculate statistics
        const totalAnalyses = historyData.length;
        const completedAnalyses = historyData.filter(h => 
          h.triangles.some(t => t.isCompleted)
        ).length;
        const exportedAnalyses = historyData.filter(h => h.exportedAt).length;

        // Fault severity analysis
        let criticalFaults = 0;
        let highFaults = 0;
        let mediumFaults = 0;
        let lowFaults = 0;

        // Triangle distribution
        const triangleDistribution = { triangle1: 0, triangle4: 0, triangle5: 0 };
        
        // Fault distribution
        const faultDistribution: Record<string, number> = {};

        historyData.forEach(history => {
          history.triangles.forEach(triangle => {
            // Count triangle methods
            if (triangle.triangleMethod === 1) triangleDistribution.triangle1++;
            if (triangle.triangleMethod === 4) triangleDistribution.triangle4++;
            if (triangle.triangleMethod === 5) triangleDistribution.triangle5++;

            // Count fault types and severity
            if (triangle.isCompleted) {
              if (triangle.dataClassification === 'Data 1' && triangle.coAnalysisResult) {
                const severity = triangle.coAnalysisResult.severity;
                if (severity === 'HIGH') criticalFaults++;
                else if (severity === 'MEDIUM') mediumFaults++;
                else lowFaults++;
                
                faultDistribution[`CO-${severity}`] = (faultDistribution[`CO-${severity}`] || 0) + 1;
              } else if (triangle.selectedFault) {
                const fault = triangle.selectedFault;
                faultDistribution[fault] = (faultDistribution[fault] || 0) + 1;

                // Categorize fault severity
                if (['D2', 'T3'].includes(fault)) criticalFaults++;
                else if (['D1', 'DT', 'T2'].includes(fault)) highFaults++;
                else if (['T1', 'C', 'PD'].includes(fault)) mediumFaults++;
                else lowFaults++;
              }
            }
          });
        });

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
          const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
          
          const count = historyData.filter(h => 
            h.createdAt.toISOString().substring(0, 7) === monthKey
          ).length;
          
          monthlyTrend.push({ month: monthName, count });
        }

        // Recent analyses (last 5)
        const recentAnalyses = historyData
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        setStats({
          totalAnalyses,
          completedAnalyses,
          exportedAnalyses,
          criticalFaults,
          highFaults,
          mediumFaults,
          lowFaults,
          recentAnalyses,
          triangleDistribution,
          faultDistribution,
          monthlyTrend
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
      case 'high': return isDark ? 'text-orange-400 bg-orange-900/20' : 'text-orange-600 bg-orange-50';
      case 'medium': return isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50';
      case 'low': return isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50';
      default: return isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-50';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-dark-card border-dark-border hover:border-dark-text/20' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div>
        <h3 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
          {value.toLocaleString()}
        </h3>
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
          {title}
        </p>
        {subtitle && (
          <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    } pt-20 p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-2`}>
                DGA Dashboard
              </h1>
              <p className={`text-lg ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Real-time analysis overview and statistics
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDashboardData}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-blue hover:bg-primary-700 text-white'
              }`}
            >
              Refresh Data
            </motion.button>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Analyses"
            value={stats.totalAnalyses}
            icon={<Assessment className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-blue-600' : 'bg-blue-500'}
            subtitle="All time"
          />
          <StatCard
            title="Completed"
            value={stats.completedAnalyses}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-green-600' : 'bg-green-500'}
            subtitle={`${stats.totalAnalyses > 0 ? Math.round((stats.completedAnalyses / stats.totalAnalyses) * 100) : 0}% completion rate`}
          />
          <StatCard
            title="Exported Reports"
            value={stats.exportedAnalyses}
            icon={<GetApp className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-purple-600' : 'bg-purple-500'}
            subtitle="PDF exports"
          />
          <StatCard
            title="Critical Faults"
            value={stats.criticalFaults}
            icon={<ErrorIcon className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-red-600' : 'bg-red-500'}
            subtitle="Requires immediate action"
          />
        </div>

        {/* Fault Severity Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl border mb-8 ${
            isDark 
              ? 'bg-dark-card border-dark-border' 
              : 'bg-white border-gray-200'
          } shadow-lg`}
        >
          <h3 className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-6`}>
            Fault Severity Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${getSeverityColor('critical')}`}>
              <div className="text-2xl font-bold">{stats.criticalFaults}</div>
              <div className="text-sm font-medium">Critical</div>
            </div>
            <div className={`p-4 rounded-xl ${getSeverityColor('high')}`}>
              <div className="text-2xl font-bold">{stats.highFaults}</div>
              <div className="text-sm font-medium">High</div>
            </div>
            <div className={`p-4 rounded-xl ${getSeverityColor('medium')}`}>
              <div className="text-2xl font-bold">{stats.mediumFaults}</div>
              <div className="text-sm font-medium">Medium</div>
            </div>
            <div className={`p-4 rounded-xl ${getSeverityColor('low')}`}>
              <div className="text-2xl font-bold">{stats.lowFaults}</div>
              <div className="text-sm font-medium">Low</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Triangle Method Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl border ${
              isDark 
                ? 'bg-dark-card border-dark-border' 
                : 'bg-white border-gray-200'
            } shadow-lg`}
          >
            <h3 className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-6`}>
              Triangle Method Usage
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>
                  Triangle 1 (CH4, C2H4, C2H2)
                </span>
                <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.triangleDistribution.triangle1}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>
                  Triangle 4 (H2, CH4, C2H6)
                </span>
                <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.triangleDistribution.triangle4}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>
                  Triangle 5 (CH4, C2H4, C2H6)
                </span>
                <span className={`font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {stats.triangleDistribution.triangle5}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl border ${
              isDark 
                ? 'bg-dark-card border-dark-border' 
                : 'bg-white border-gray-200'
            } shadow-lg`}
          >
            <h3 className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-6`}>
              Monthly Analysis Trend
            </h3>
            <div className="space-y-3">
              {stats.monthlyTrend.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>
                    {month.month}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-20 h-2 rounded-full ${isDark ? 'bg-dark-border' : 'bg-gray-200'} overflow-hidden`}>
                      <div 
                        className={`h-full ${isDark ? 'bg-primary-500' : 'bg-primary-blue'} transition-all duration-500`}
                        style={{ 
                          width: `${Math.max(5, (month.count / Math.max(...stats.monthlyTrend.map(m => m.count), 1)) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className={`font-bold w-8 text-right ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                      {month.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl border ${
            isDark 
              ? 'bg-dark-card border-dark-border' 
              : 'bg-white border-gray-200'
          } shadow-lg`}
        >
          <h3 className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'} mb-6`}>
            Recent Analyses
          </h3>
          
          {stats.recentAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <Science className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                No analyses found
              </p>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-400'}`}>
                Start your first DGA analysis to see data here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 rounded-xl border ${
                    isDark 
                      ? 'bg-dark-surface border-dark-border' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-primary-600' : 'bg-primary-blue'}`}>
                        <Analytics className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                          {analysis.reportHeader?.idTrafo || `Analysis ${analysis.id.slice(-4)}`}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <DateRange className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>
                            {analysis.createdAt.toLocaleDateString('id-ID')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            analysis.exportedAt 
                              ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600'
                              : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {analysis.exportedAt ? 'Exported' : 'Not exported'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                        {analysis.triangles.length} triangles
                      </div>
                      <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                        {analysis.triangles.filter(t => t.isCompleted).length} completed
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartAnalysis}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-blue hover:bg-primary-700 text-white'
              }`}
            >
              <Lightbulb className="w-5 h-5 mr-2 inline" />
              New Analysis
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistoryModal(true)}
              className={`px-6 py-3 rounded-xl font-medium border transition-colors ${
                isDark
                  ? 'border-dark-border text-dark-text hover:bg-dark-surface'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5 mr-2 inline" />
              View History
            </motion.button>
          </div>
        </motion.div>
      </div>
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onLoadHistory={handleLoadHistory}
      />
    </div>
  );
};

export default Dashboard; 