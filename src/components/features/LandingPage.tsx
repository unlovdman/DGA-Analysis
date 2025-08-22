import React from 'react';
import { motion } from 'framer-motion';
import { Science, ElectricBolt } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface LandingPageProps {
  onSelectAnalysis: (type: 'dga' | 'breakdown') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectAnalysis }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    } flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16`}>
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r ${
            isDark 
              ? 'from-blue-400 to-purple-400' 
              : 'from-primary-blue to-primary-accent'
          } bg-clip-text text-transparent`}>
            HALLO TRAFO
          </h1>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed ${
            isDark ? 'text-dark-muted' : 'text-gray-600'
          }`}>
            Professional Transformer Analysis Platform - Choose your analysis method
          </p>
        </motion.div>

        {/* Analysis Type Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          {/* Breakdown Voltage Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -8 }}
            className="group cursor-pointer"
            onClick={() => onSelectAnalysis('breakdown')}
          >
            <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 h-[400px] sm:h-[440px] lg:h-[480px] border-2 transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/30 hover:border-yellow-500/50 hover:shadow-yellow-500/20' 
                : 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:border-yellow-400 hover:shadow-yellow-400/20'
            } shadow-xl hover:shadow-2xl`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className={`w-full h-full ${
                  isDark ? 'bg-gradient-to-br from-yellow-400 to-orange-600' : 'bg-gradient-to-br from-yellow-300 to-orange-500'
                }`}></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 ${
                    isDark ? 'bg-yellow-800/50' : 'bg-yellow-200'
                  }`}>
                    <ElectricBolt className={`w-10 h-10 ${
                      isDark ? 'text-yellow-400' : 'text-yellow-700'
                    }`} />
                  </div>
                  
                  <h2 className={`text-3xl font-bold mb-6 ${
                    isDark ? 'text-yellow-300' : 'text-yellow-800'
                  }`}>
                    BREAKDOWN VOLTAGE
                  </h2>
                  
                  <p className={`text-base mb-6 leading-relaxed ${
                    isDark ? 'text-yellow-200/80' : 'text-yellow-700'
                  }`}>
                    METODA IEC 60156-95<br />
                    BATASAN IEC 60422:2013
                  </p>
                  
                  <div className={`space-y-3 text-base ${
                    isDark ? 'text-yellow-200/70' : 'text-yellow-600'
                  }`}>
                    <p>• Dielectric Strength Analysis</p>
                    <p>• Voltage Breakdown Testing</p>
                    <p>• Insulation Quality Assessment</p>
                    <p>• Maintenance Recommendations</p>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mt-10 px-8 py-5 rounded-full text-center font-bold text-lg transition-all duration-300 shadow-lg ${
                    isDark 
                      ? 'bg-yellow-600 text-yellow-50 group-hover:bg-yellow-500 group-hover:shadow-yellow-500/50' 
                      : 'bg-yellow-700 text-white group-hover:bg-yellow-800 group-hover:shadow-yellow-600/50'
                  } group-hover:shadow-xl transform group-hover:-translate-y-1`}>
                  Start Breakdown Analysis
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* DGA Analysis Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -8 }}
            className="group cursor-pointer"
            onClick={() => onSelectAnalysis('dga')}
          >
            <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 h-[400px] sm:h-[440px] lg:h-[480px] border-2 transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/30 hover:border-blue-500/50 hover:shadow-blue-500/20' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:border-blue-400 hover:shadow-blue-400/20'
            } shadow-xl hover:shadow-2xl`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className={`w-full h-full ${
                  isDark ? 'bg-gradient-to-br from-blue-400 to-indigo-600' : 'bg-gradient-to-br from-blue-300 to-indigo-500'
                }`}></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 ${
                    isDark ? 'bg-blue-800/50' : 'bg-blue-200'
                  }`}>
                    <Science className={`w-10 h-10 ${
                      isDark ? 'text-blue-400' : 'text-blue-700'
                    }`} />
                  </div>
                  
                  <h2 className={`text-3xl font-bold mb-6 ${
                    isDark ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    DISSOLVED GAS ANALYSIS
                  </h2>
                  
                  <p className={`text-base mb-6 leading-relaxed ${
                    isDark ? 'text-blue-200/80' : 'text-blue-700'
                  }`}>
                    IEEE C57.104-2019 Standard<br />
                    Duval Triangle Method
                  </p>
                  
                  <div className={`space-y-3 text-base ${
                    isDark ? 'text-blue-200/70' : 'text-blue-600'
                  }`}>
                    <p>• Triangle 1, 4, 5 Analysis</p>
                    <p>• Multi-Classification Support</p>
                    <p>• Real-time Fault Detection</p>
                    <p>• Comprehensive PDF Reports</p>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mt-10 px-8 py-5 rounded-full text-center font-bold text-lg transition-all duration-300 shadow-lg ${
                    isDark 
                      ? 'bg-blue-600 text-blue-50 group-hover:bg-blue-500 group-hover:shadow-blue-500/50' 
                      : 'bg-blue-700 text-white group-hover:bg-blue-800 group-hover:shadow-blue-600/50'
                  } group-hover:shadow-xl transform group-hover:-translate-y-1`}>
                  Start DGA Analysis
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Standards Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`text-center p-6 sm:p-8 rounded-2xl border max-w-4xl mx-auto ${
            isDark 
              ? 'bg-dark-card border-dark-border text-dark-muted' 
              : 'bg-white/50 border-gray-200 text-gray-600'
          }`}
        >
          <p className="text-base sm:text-lg leading-relaxed">
            Professional transformer analysis platform compliant with international standards.<br />
            Choose the appropriate analysis method for your transformer testing requirements.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage; 