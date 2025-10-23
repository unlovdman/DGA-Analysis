import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElectricBolt, Assessment, CheckCircle, Warning, Error as ErrorIcon, Save, GetApp, ArrowBack, History } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';
import BreakdownVoltageHistoryModal from './BreakdownVoltageHistory';
import { BREAKDOWN_VOLTAGE_PREVENTIVE_MAINTENANCE, TRANSFORMER_VOLTAGE_RANGES, analyzeBreakdownVoltage } from '../../data/breakdownVoltage';
import { generateBreakdownVoltagePDF } from '../../utils/pdfGenerator';
import type { BreakdownVoltageData, TransformerType } from '../../types';

interface BreakdownVoltageAnalysisProps {
  onBack: () => void;
}

const BreakdownVoltageAnalysis: React.FC<BreakdownVoltageAnalysisProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [analysisData, setAnalysisData] = useState<Partial<BreakdownVoltageData>>({
    idTrafo: '',
    transformerType: undefined,
    dielectricStrengths: [0, 0, 0, 0, 0, 0],
    average: 0,
    result: undefined,
    recommendation: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleIdTrafoChange = (value: string) => {
    setAnalysisData(prev => ({ ...prev, idTrafo: value }));
  };

  const handleTransformerTypeChange = (type: TransformerType) => {
    setAnalysisData(prev => ({ ...prev, transformerType: type }));
  };

  const handleDielectricStrengthChange = (index: number, value: number) => {
    const newStrengths = [...(analysisData.dielectricStrengths || [])];
    newStrengths[index] = value;
    const average = newStrengths.reduce((sum, val) => sum + val, 0) / newStrengths.length;
    
    setAnalysisData(prev => ({ 
      ...prev, 
      dielectricStrengths: newStrengths,
      average: Math.round(average * 100) / 100
    }));
  };

  const performAnalysis = () => {
    if (!analysisData.transformerType || !analysisData.average) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    const result = analyzeBreakdownVoltage(analysisData.average, analysisData.transformerType);
    
    setAnalysisData(prev => ({
      ...prev,
      result: result.result as 'good' | 'fair' | 'poor',
      recommendation: result.recommendation,
      id: `bv-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date()
    }));
    
    setIsAnalysisComplete(true);
    showToast('Analysis completed successfully!', 'success');
  };

  const saveResults = () => {
    if (!isAnalysisComplete) return;
    
    const existingHistory = JSON.parse(localStorage.getItem('breakdownVoltageHistory') || '[]');
    existingHistory.push({
      id: Date.now().toString(),
      breakdownData: analysisData,
      createdAt: new Date()
    });
    localStorage.setItem('breakdownVoltageHistory', JSON.stringify(existingHistory));
    
    showToast('Results saved successfully!', 'success');
  };

  const exportToPDF = () => {
    if (!isAnalysisComplete || !analysisData.transformerType) {
      showToast('Please complete the analysis first', 'error');
      return;
    }

    const selectedRange = TRANSFORMER_VOLTAGE_RANGES.find(r => r.type === analysisData.transformerType);
    if (!selectedRange) {
      showToast('Transformer range not found', 'error');
      return;
    }

    try {
      generateBreakdownVoltagePDF({
        breakdownData: analysisData as BreakdownVoltageData,
        transformerRange: selectedRange
      });
      showToast('PDF exported successfully!', 'success');
    } catch (error) {
      showToast('Failed to export PDF', 'error');
      console.error('PDF export error:', error);
    }
  };

  const getSeverityColor = (result?: string) => {
    switch (result) {
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (result?: string) => {
    switch (result) {
      case 'poor': return <ErrorIcon className="w-6 h-6 text-red-600" />;
      case 'fair': return <Warning className="w-6 h-6 text-yellow-600" />;
      case 'good': return <CheckCircle className="w-6 h-6 text-green-600" />;
      default: return <Assessment className="w-6 h-6 text-gray-600" />;
    }
  };

  const selectedRange = analysisData.transformerType 
    ? TRANSFORMER_VOLTAGE_RANGES.find(r => r.type === analysisData.transformerType)
    : null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card' 
        : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50'
    } pt-20 p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <ElectricBolt className="w-12 h-12 text-yellow-600 mr-4" />
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              isDark 
                ? 'from-yellow-400 to-orange-400' 
                : 'from-yellow-600 to-orange-600'
            } bg-clip-text text-transparent`}>
              Breakdown Voltage Analysis
            </h1>
          </div>
          <p className={`text-lg max-w-3xl mx-auto ${
            isDark ? 'text-dark-muted' : 'text-gray-600'
          }`}>
            IEC 60156-95 Method with IEC 60422:2024 Standards
          </p>
        </motion.div>

        {/* Step 1: ID Trafo Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl shadow-xl p-6 mb-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-dark-card border-dark-border' 
              : 'bg-white border-gray-100'
          }`}
        >
          <h3 className={`text-xl font-bold mb-4 ${
            isDark ? 'text-dark-text' : 'text-gray-800'
          }`}>
            1. ID Transformator
          </h3>
          <input
            type="text"
            value={analysisData.idTrafo}
            onChange={(e) => handleIdTrafoChange(e.target.value)}
            placeholder="Masukkan ID Transformator"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
              isDark 
                ? 'border-dark-border bg-dark-surface text-dark-text' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
        </motion.div>

        {/* Step 2: Transformer Type Selection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl shadow-xl p-6 mb-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-dark-card border-dark-border' 
              : 'bg-white border-gray-100'
          }`}
        >
          <h3 className={`text-xl font-bold mb-4 ${
            isDark ? 'text-dark-text' : 'text-gray-800'
          }`}>
            2. Jenis Transformator
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {TRANSFORMER_VOLTAGE_RANGES.map((range) => (
              <motion.div
                key={range.type}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  analysisData.transformerType === range.type
                    ? isDark 
                      ? 'border-yellow-500 bg-yellow-900/20' 
                      : 'border-yellow-500 bg-yellow-50'
                    : isDark
                      ? 'border-dark-border hover:border-yellow-700'
                      : 'border-gray-200 hover:border-yellow-300'
                }`}
                onClick={() => handleTransformerTypeChange(range.type)}
              >
                <h4 className={`font-bold mb-2 ${
                  isDark ? 'text-dark-text' : 'text-gray-800'
                }`}>
                  Type {range.type} ({range.voltageRange})
                </h4>
                <div className={`text-sm space-y-1 ${
                  isDark ? 'text-dark-muted' : 'text-gray-600'
                }`}>
                  <p>• Baik: {range.good}</p>
                  <p>• Cukup: {range.fair}</p>
                  <p>• Buruk: {range.poor}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Step 3: Dielectric Strength Input */}
        {analysisData.transformerType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl shadow-xl p-6 mb-6 border transition-colors duration-300 ${
              isDark 
                ? 'bg-dark-card border-dark-border' 
                : 'bg-white border-gray-100'
            }`}
          >
            <h3 className={`text-xl font-bold mb-4 ${
              isDark ? 'text-dark-text' : 'text-gray-800'
            }`}>
              3. Dielectric Strength
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {analysisData.dielectricStrengths?.map((strength, index) => (
                <div key={index}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-dark-text' : 'text-gray-700'
                  }`}>
                    {index === 0 ? '5 Menit' : '2 Menit'} = ... kV
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={strength || ''}
                    onChange={(e) => handleDielectricStrengthChange(index, parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'border-dark-border bg-dark-surface text-dark-text' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
              ))}
            </div>
            
            {/* Average Display */}
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-yellow-900/20 border-yellow-700/30' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h4 className={`font-bold mb-2 ${
                isDark ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                Average = {analysisData.average} kV
              </h4>
              <p className={`text-sm ${
                isDark ? 'text-yellow-200/80' : 'text-yellow-700'
              }`}>
                Average didapatkan dari rata-rata dielectric strength (Hasil yang dipakai analisis dan rekomendasi)
              </p>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                onClick={performAnalysis}
                disabled={!analysisData.transformerType || !analysisData.average}
                className="w-full"
              >
                <Assessment className="w-4 h-4 mr-2" />
                Perform Analysis
              </Button>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {isAnalysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-2xl shadow-xl p-8 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-dark-card border-dark-border' 
                  : 'bg-white border-gray-100'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                isDark ? 'text-dark-text' : 'text-gray-900'
              }`}>
                <Assessment className={`w-8 h-8 mr-3 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                Hasil Analisis Breakdown Voltage
              </h3>

              {/* Analysis Result */}
              <div className={`p-6 rounded-xl border mb-6 ${getSeverityColor(analysisData.result)}`}>
                <div className="flex items-start">
                  {getSeverityIcon(analysisData.result)}
                  <div className="ml-4">
                    <h4 className="font-bold text-lg mb-2">
                      Hasil: {analysisData.result?.toUpperCase()} ({analysisData.average} kV)
                    </h4>
                    <p className="leading-relaxed text-sm">
                      Berdasarkan standar IEC 60422:2024 untuk transformator jenis {analysisData.transformerType} 
                      ({selectedRange?.voltageRange}), nilai tegangan tembus {analysisData.average} kV 
                      termasuk dalam kondisi <strong>{analysisData.result}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-6 rounded-xl border ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700/30' 
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
              }`}>
                <h4 className={`font-bold text-lg mb-4 ${
                  isDark ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  Rekomendasi Pemeliharaan
                </h4>
                <p className={`leading-relaxed ${
                  isDark ? 'text-dark-text' : 'text-gray-700'
                }`}>
                  {analysisData.recommendation}
                </p>
              </div>

              {/* Preventive Maintenance */}
              <div className={`mt-4 p-6 rounded-xl border ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700/30' 
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
              }`}>
                <h4 className={`font-bold text-lg mb-4 ${
                  isDark ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  Pemeliharaan Preventif
                </h4>
                <p className={`leading-relaxed ${
                  isDark ? 'text-dark-text' : 'text-gray-700'
                }`}>
                  {
                    analysisData.result
                      ? BREAKDOWN_VOLTAGE_PREVENTIVE_MAINTENANCE[analysisData.result]
                      : 'Belum ada hasil analisis'
                  }
                </p>
              </div>


              

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <Button variant="primary" onClick={saveResults}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Hasil
                </Button>
                
                <Button variant="outline" onClick={exportToPDF}>
                  <GetApp className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>

                <Button variant="outline" onClick={() => setShowHistoryModal(true)}>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <BreakdownVoltageHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};

export default BreakdownVoltageAnalysis; 