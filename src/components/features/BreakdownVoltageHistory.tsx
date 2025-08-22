import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Close,
  Delete,
  GetApp,
  FilterList,
  Sort,
  DateRange,
  ElectricBolt,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ClearAll,
  SelectAll,
  Clear
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { generateBreakdownVoltagePDF, generateBulkBreakdownVoltagePDF } from '../../utils/pdfGenerator';
import { TRANSFORMER_VOLTAGE_RANGES } from '../../data/breakdownVoltage';
import type { BreakdownVoltageHistory } from '../../types';

interface BreakdownVoltageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadHistory?: (history: BreakdownVoltageHistory) => void;
}

type FilterType = 'all' | 'good' | 'fair' | 'poor';
type SortType = 'date' | 'idTrafo' | 'result' | 'voltage';
type SortDirection = 'asc' | 'desc';

const BreakdownVoltageHistoryModal: React.FC<BreakdownVoltageHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadHistory
}) => {
  const { isDark } = useTheme();
  const [history, setHistory] = useState<BreakdownVoltageHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<BreakdownVoltageHistory[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [history, filter, sortBy, sortDirection]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('breakdownVoltageHistory');
      if (saved) {
        const historyData: BreakdownVoltageHistory[] = JSON.parse(saved).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          exportedAt: item.exportedAt ? new Date(item.exportedAt) : undefined
        }));
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error loading breakdown voltage history:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...history];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.breakdownData.result === filter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'idTrafo':
          aValue = a.breakdownData.idTrafo || '';
          bValue = b.breakdownData.idTrafo || '';
          break;
        case 'result':
          aValue = a.breakdownData.result;
          bValue = b.breakdownData.result;
          break;
        case 'voltage':
          aValue = a.breakdownData.average;
          bValue = b.breakdownData.average;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredHistory(filtered);
  };

  const handleExportPDF = async (historyItem: BreakdownVoltageHistory) => {
    setIsExporting(true);
    try {
      const transformerRange = TRANSFORMER_VOLTAGE_RANGES.find(
        range => range.type === historyItem.breakdownData.transformerType
      );

      if (!transformerRange) {
        throw new Error('Transformer range not found');
      }

      await generateBreakdownVoltagePDF({
        breakdownData: historyItem.breakdownData,
        transformerRange: {
          type: transformerRange.type,
          label: transformerRange.label,
          voltageRange: transformerRange.voltageRange,
          good: transformerRange.good,
          fair: transformerRange.fair,
          poor: transformerRange.poor
        }
      });

      // Update export timestamp
      const updatedHistory = history.map(item => 
        item.id === historyItem.id 
          ? { ...item, exportedAt: new Date() }
          : item
      );
      setHistory(updatedHistory);
      localStorage.setItem('breakdownVoltageHistory', JSON.stringify(updatedHistory));

      showToast('PDF berhasil di-export!', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('Gagal export PDF', 'error');
    }
    setIsExporting(false);
  };

  const handleBulkExport = async () => {
    if (selectedItems.size === 0) {
      showToast('Pilih minimal satu analysis untuk export', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const selectedHistoryItems = history.filter(item => selectedItems.has(item.id));
      await generateBulkBreakdownVoltagePDF(selectedHistoryItems);

      // Update export timestamps for all selected items
      const updatedHistory = history.map(item => 
        selectedItems.has(item.id) 
          ? { ...item, exportedAt: new Date() }
          : item
      );
      setHistory(updatedHistory);
      localStorage.setItem('breakdownVoltageHistory', JSON.stringify(updatedHistory));

      showToast(`${selectedItems.size} analysis berhasil di-export dalam satu PDF!`, 'success');
      setSelectedItems(new Set()); // Clear selection
    } catch (error) {
      console.error('Error bulk exporting PDF:', error);
      showToast('Gagal bulk export PDF', 'error');
    }
    setIsExporting(false);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredHistory.map(item => item.id));
    setSelectedItems(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('breakdownVoltageHistory', JSON.stringify(updatedHistory));
    
    // Remove from selection if selected
    const newSelected = new Set(selectedItems);
    newSelected.delete(id);
    setSelectedItems(newSelected);
    
    showToast('Riwayat berhasil dihapus', 'success');
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat? Tindakan ini tidak dapat dibatalkan.')) {
      setHistory([]);
      setSelectedItems(new Set());
      localStorage.removeItem('breakdownVoltageHistory');
      showToast('Semua riwayat berhasil dihapus', 'success');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
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

  const getSeverityColor = (result: string) => {
    switch (result) {
      case 'poor': return isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
      case 'fair': return isDark ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50';
      case 'good': return isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50';
      default: return isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (result: string) => {
    switch (result) {
      case 'poor': return <ErrorIcon className="w-4 h-4" />;
      case 'fair': return <Warning className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      default: return <ElectricBolt className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-dark-card' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-dark-border bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : 'border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ElectricBolt className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <h2 className={`text-xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                  Breakdown Voltage Analysis History
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {filteredHistory.length} item{filteredHistory.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-dark-surface text-dark-muted' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <Close className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className={`px-6 py-4 border-b ${isDark ? 'border-dark-border' : 'border-gray-200'}`}>
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter */}
              <div className="flex items-center space-x-2">
                <FilterList className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    isDark 
                      ? 'border-dark-border bg-dark-surface text-dark-text' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Results</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <Sort className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`} />
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [sort, direction] = e.target.value.split('-');
                    setSortBy(sort as SortType);
                    setSortDirection(direction as SortDirection);
                  }}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    isDark 
                      ? 'border-dark-border bg-dark-surface text-dark-text' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="idTrafo-asc">ID Trafo A-Z</option>
                  <option value="idTrafo-desc">ID Trafo Z-A</option>
                  <option value="voltage-desc">Voltage High-Low</option>
                  <option value="voltage-asc">Voltage Low-High</option>
                  <option value="result-asc">Result Good-Poor</option>
                  <option value="result-desc">Result Poor-Good</option>
                </select>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center space-x-2 ml-auto">
                <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                  {selectedItems.size} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    isDark
                      ? 'border-dark-border text-dark-text hover:bg-dark-surface'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <SelectAll className="w-3 h-3 mr-1 inline" />
                  All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    isDark
                      ? 'border-dark-border text-dark-text hover:bg-dark-surface'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Clear className="w-3 h-3 mr-1 inline" />
                  None
                </button>
              </div>

              {/* Bulk Export */}
              <button
                onClick={handleBulkExport}
                disabled={selectedItems.size === 0 || isExporting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedItems.size === 0 || isExporting
                    ? isDark 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                <GetApp className="w-4 h-4 mr-2 inline" />
                Export ({selectedItems.size})
              </button>

              {/* Clear All */}
              <button
                onClick={handleClearAllHistory}
                disabled={history.length === 0}
                className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                  history.length === 0
                    ? isDark 
                      ? 'border-gray-700 text-gray-500 cursor-not-allowed'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'border-red-600 text-red-400 hover:bg-red-900/20'
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                <ClearAll className="w-4 h-4 mr-2 inline" />
                Clear All
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <ElectricBolt className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                  {history.length === 0 ? 'No Analysis History' : 'No Results Found'}
                </p>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                  {history.length === 0 
                    ? 'Start your first breakdown voltage analysis to see history here'
                    : 'Try adjusting your filter or search criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {filteredHistory.map((historyItem, index) => (
                  <motion.div
                    key={historyItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-xl border p-4 transition-all duration-200 ${
                      selectedItems.has(historyItem.id)
                        ? isDark
                          ? 'border-yellow-500 bg-yellow-900/10'
                          : 'border-yellow-400 bg-yellow-50'
                        : isDark 
                          ? 'border-dark-border bg-dark-surface hover:border-dark-text/20' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedItems.has(historyItem.id)}
                          onChange={() => handleSelectItem(historyItem.id)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />

                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'}`}>
                          <ElectricBolt className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-medium ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                              {historyItem.breakdownData.idTrafo || `Analysis ${historyItem.id.slice(-4)}`}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(historyItem.breakdownData.result)}`}>
                              {getSeverityIcon(historyItem.breakdownData.result)}
                              <span className="ml-1">{historyItem.breakdownData.result.toUpperCase()}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className={`font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                                Type:
                              </span>
                              <div className={isDark ? 'text-dark-text' : 'text-gray-900'}>
                                {historyItem.breakdownData.transformerType}
                              </div>
                            </div>
                            <div>
                              <span className={`font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                                Average:
                              </span>
                              <div className={isDark ? 'text-dark-text' : 'text-gray-900'}>
                                {historyItem.breakdownData.average} kV
                              </div>
                            </div>
                            <div>
                              <span className={`font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                                Date:
                              </span>
                              <div className={isDark ? 'text-dark-text' : 'text-gray-900'}>
                                {historyItem.createdAt.toLocaleDateString('id-ID')}
                              </div>
                            </div>
                            <div>
                              <span className={`font-medium ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                                Exported:
                              </span>
                              <div className={isDark ? 'text-dark-text' : 'text-gray-900'}>
                                {historyItem.exportedAt ? historyItem.exportedAt.toLocaleDateString('id-ID') : 'Never'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {onLoadHistory && (
                          <button
                            onClick={() => {
                              onLoadHistory(historyItem);
                              onClose();
                            }}
                            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
                              isDark
                                ? 'border-blue-600 text-blue-400 hover:bg-blue-900/20'
                                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            Load
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleExportPDF(historyItem)}
                          disabled={isExporting}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            isExporting
                              ? isDark
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDark
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          <GetApp className="w-3 h-3 mr-1 inline" />
                          PDF
                        </button>
                        
                        <button
                          onClick={() => handleDeleteHistory(historyItem.id)}
                          className={`p-1 rounded transition-colors ${
                            isDark
                              ? 'text-red-400 hover:bg-red-900/20'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BreakdownVoltageHistoryModal; 