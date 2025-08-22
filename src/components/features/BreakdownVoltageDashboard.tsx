import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ElectricBolt,
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Timeline,
  Analytics,
  History,
  GetApp,
  DateRange,
  Lightbulb,
  BarChart
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import type { BreakdownVoltageHistory, BreakdownVoltageData } from '../../types';

interface BreakdownVoltageDashboardStats {
  totalAnalyses: number;
  goodResults: number;
  fairResults: number;
  poorResults: number;
  recentAnalyses: BreakdownVoltageHistory[];
  transformerTypeDistribution: { O: number; A: number; B: number; C: number };
  averageVoltageByType: { O: number; A: number; B: number; C: number };
  monthlyTrend: { month: string; count: number }[];
}

const BreakdownVoltageDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<BreakdownVoltageDashboardStats>({
    totalAnalyses: 0,
    goodResults: 0,
    fairResults: 0,
    poorResults: 0,
    recentAnalyses: [],
    transformerTypeDistribution: { O: 0, A: 0, B: 0, C: 0 },
    averageVoltageByType: { O: 0, A: 0, B: 0, C: 0 },
    monthlyTrend: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const saved = localStorage.getItem('breakdownVoltageHistory');
      if (saved) {
        const historyData: BreakdownVoltageHistory[] = JSON.parse(saved).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          exportedAt: item.exportedAt ? new Date(item.exportedAt) : undefined
        }));

        // Calculate statistics
        const totalAnalyses = historyData.length;
        
        // Result distribution
        let goodResults = 0;
        let fairResults = 0;
        let poorResults = 0;

        // Transformer type distribution
        const transformerTypeDistribution = { O: 0, A: 0, B: 0, C: 0 };
        const voltageByType = { O: [], A: [], B: [], C: [] } as Record<string, number[]>;

        historyData.forEach(history => {
          const data = history.breakdownData;
          
          // Count results
          if (data.result === 'good') goodResults++;
          else if (data.result === 'fair') fairResults++;
          else if (data.result === 'poor') poorResults++;

          // Count transformer types and collect voltage data
          if (data.transformerType) {
            transformerTypeDistribution[data.transformerType]++;
            voltageByType[data.transformerType].push(data.average);
          }
        });

        // Calculate average voltage by transformer type
        const averageVoltageByType = { O: 0, A: 0, B: 0, C: 0 };
        Object.keys(voltageByType).forEach(type => {
          const voltages = voltageByType[type as keyof typeof voltageByType];
          if (voltages.length > 0) {
            averageVoltageByType[type as keyof typeof averageVoltageByType] = 
              Math.round((voltages.reduce((sum, v) => sum + v, 0) / voltages.length) * 100) / 100;
          }
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
          goodResults,
          fairResults,
          poorResults,
          recentAnalyses,
          transformerTypeDistribution,
          averageVoltageByType,
          monthlyTrend
        });
      }
    } catch (error) {
      console.error('Error loading breakdown voltage dashboard data:', error);
    }
  };

  const getSeverityColor = (result: string) => {
    switch (result) {
      case 'poor': return isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
      case 'fair': return isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50';
      case 'good': return isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50';
      default: return isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-50';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
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
          {typeof value === 'number' ? value.toLocaleString() : value}
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
        : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50'
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
                Breakdown Voltage Dashboard
              </h1>
              <p className={`text-lg ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                Voltage breakdown analysis overview and statistics
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDashboardData}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
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
            icon={<ElectricBolt className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-yellow-600' : 'bg-yellow-500'}
            subtitle="All time"
          />
          <StatCard
            title="Good Results"
            value={stats.goodResults}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-green-600' : 'bg-green-500'}
            subtitle={`${stats.totalAnalyses > 0 ? Math.round((stats.goodResults / stats.totalAnalyses) * 100) : 0}% of total`}
          />
          <StatCard
            title="Fair Results"
            value={stats.fairResults}
            icon={<Warning className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-yellow-600' : 'bg-yellow-500'}
            subtitle="Needs monitoring"
          />
          <StatCard
            title="Poor Results"
            value={stats.poorResults}
            icon={<ErrorIcon className="w-6 h-6 text-white" />}
            color={isDark ? 'bg-red-600' : 'bg-red-500'}
            subtitle="Requires action"
          />
        </div>

        {/* Result Distribution */}
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
            Voltage Condition Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${getSeverityColor('good')}`}>
              <div className="text-2xl font-bold">{stats.goodResults}</div>
              <div className="text-sm font-medium">Good Condition</div>
              <div className="text-xs mt-1">Voltage breakdown adequate</div>
            </div>
            <div className={`p-4 rounded-xl ${getSeverityColor('fair')}`}>
              <div className="text-2xl font-bold">{stats.fairResults}</div>
              <div className="text-sm font-medium">Fair Condition</div>
              <div className="text-xs mt-1">Monitoring required</div>
            </div>
            <div className={`p-4 rounded-xl ${getSeverityColor('poor')}`}>
              <div className="text-2xl font-bold">{stats.poorResults}</div>
              <div className="text-sm font-medium">Poor Condition</div>
              <div className="text-xs mt-1">Immediate action needed</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Transformer Type Distribution */}
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
              Transformer Type Analysis
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.transformerTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-700'}`}>
                      Type {type} ({
                        type === 'O' ? '> 400KV' :
                        type === 'A' ? '170-400KV' :
                        type === 'B' ? '72.5KV' : '< 72.5KV'
                      })
                    </span>
                    <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                      Avg: {stats.averageVoltageByType[type as keyof typeof stats.averageVoltageByType]} kV
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${
                    isDark ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {count}
                  </span>
                </div>
              ))}
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
                        className={`h-full ${isDark ? 'bg-yellow-500' : 'bg-yellow-600'} transition-all duration-500`}
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
            Recent Breakdown Voltage Analyses
          </h3>
          
          {stats.recentAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <ElectricBolt className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                No analyses found
              </p>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-400'}`}>
                Start your first breakdown voltage analysis to see data here
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
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'}`}>
                        <ElectricBolt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                          {analysis.breakdownData.idTrafo || `Analysis ${analysis.id.slice(-4)}`}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <DateRange className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-dark-muted' : 'text-gray-500'}>
                            {analysis.createdAt.toLocaleDateString('id-ID')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(analysis.breakdownData.result)}`}>
                            {analysis.breakdownData.result.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                        {analysis.breakdownData.average} kV
                      </div>
                      <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                        Type {analysis.breakdownData.transformerType}
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
          className="text-center mt-8"
        >
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              <Lightbulb className="w-5 h-5 mr-2 inline" />
              New Analysis
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
    </div>
  );
};

export default BreakdownVoltageDashboard; 