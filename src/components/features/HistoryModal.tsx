import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Close, 
  Delete, 
  Visibility, 
  GetApp,
  DateRange,
  Assessment 
} from '@mui/icons-material';
import Button from '../ui/Button';
import type { AnalysisHistory } from '../../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadHistory: (history: AnalysisHistory) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadHistory
}) => {
  const [historyData, setHistoryData] = useState<AnalysisHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistoryData();
    }
  }, [isOpen]);

  const loadHistoryData = () => {
    try {
      const saved = localStorage.getItem('dgaAnalysisHistory');
      if (saved) {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          exportedAt: item.exportedAt ? new Date(item.exportedAt) : undefined
        }));
        setHistoryData(parsed);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const deleteHistory = (historyId: string) => {
    try {
      const updated = historyData.filter(h => h.id !== historyId);
      setHistoryData(updated);
      localStorage.setItem('dgaAnalysisHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  const clearAllHistory = () => {
    if (confirm('Hapus semua riwayat analisis? Tindakan ini tidak dapat dibatalkan.')) {
      setHistoryData([]);
      localStorage.removeItem('dgaAnalysisHistory');
    }
  };

  const handleLoadHistory = (history: AnalysisHistory) => {
    onLoadHistory(history);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <History className="w-6 h-6 text-primary-accent mr-3" />
                <h3 className="text-xl font-bold">Riwayat Analisis DGA</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            {historyData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Belum ada riwayat analisis</p>
                <p className="text-sm">Mulai analisis baru untuk menyimpan riwayat</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-600">
                    {historyData.length} analisis tersimpan
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllHistory}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Delete className="w-4 h-4 mr-1" />
                    Hapus Semua
                  </Button>
                </div>

                <div className="space-y-4">
                  {historyData.map((history) => (
                    <div key={history.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="text-sm font-medium text-gray-900">
                              {history.reportHeader?.idTrafo || 'Analisis DGA'}
                            </div>
                            <div className="text-xs text-gray-500">
                              <DateRange className="w-3 h-3 mr-1 inline" />
                              {history.createdAt.toLocaleDateString('id-ID')} • {history.createdAt.toLocaleTimeString('id-ID')}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600 mb-3">
                            {history.reportHeader && (
                              <>
                                <div>
                                  <span className="font-medium">Serial:</span> {history.reportHeader.serialNo}
                                </div>
                                <div>
                                  <span className="font-medium">Power:</span> {history.reportHeader.powerRating}
                                </div>
                                <div>
                                  <span className="font-medium">Year:</span> {history.reportHeader.year}
                                </div>
                                <div>
                                  <span className="font-medium">Sampling:</span> {history.reportHeader.samplingDate}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center">
                              <Assessment className="w-3 h-3 mr-1 text-blue-600" />
                              <span>{history.triangles.length} triangles</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              <span>{history.triangles.filter(t => t.isCompleted).length} selesai</span>
                            </div>
                            {history.exportedAt && (
                              <div className="flex items-center text-green-600">
                                <GetApp className="w-3 h-3 mr-1" />
                                <span>Exported</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedHistory(history)}
                          >
                            <Visibility className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleLoadHistory(history)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteHistory(history.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Delete className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
              {selectedHistory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Detail Analisis</h4>
                      <button
                        onClick={() => setSelectedHistory(null)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <Close className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedHistory.reportHeader && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium mb-2">Report Header</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>ID Trafo:</strong> {selectedHistory.reportHeader.idTrafo}</div>
                            <div><strong>Serial No:</strong> {selectedHistory.reportHeader.serialNo}</div>
                            <div><strong>Power Rating:</strong> {selectedHistory.reportHeader.powerRating}</div>
                            <div><strong>Voltage Ratio:</strong> {selectedHistory.reportHeader.voltageRatio}</div>
                            <div><strong>Manufacture:</strong> {selectedHistory.reportHeader.manufacture}</div>
                            <div><strong>Year:</strong> {selectedHistory.reportHeader.year}</div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium mb-2">Triangles ({selectedHistory.triangles.length})</h5>
                        <div className="space-y-2">
                          {selectedHistory.triangles.map(triangle => (
                            <div key={triangle.id} className="bg-blue-50 rounded p-3 text-sm">
                              <div className="font-medium">
                                Triangle {triangle.triangleMethod} - {triangle.dataClassification}
                              </div>
                              <div className="text-gray-600">
                                {triangle.dataClassification === 'Data 1' 
                                  ? triangle.coAnalysisResult?.severity
                                  : triangle.selectedFault
                                } • {triangle.images?.length || 0} images
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t">
                      <Button
                        variant="primary"
                        onClick={() => handleLoadHistory(selectedHistory)}
                      >
                        Load Analisis Ini
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedHistory(null)}
                      >
                        Tutup
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HistoryModal; 