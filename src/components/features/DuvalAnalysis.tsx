import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudUpload,
  Analytics,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Assessment,
  Science,
  Delete,
  ContentPaste,
  Screenshot,
  Edit,
  Save,
  Add,
  FilterList,
  GetApp,
  Print,
  Sort,
  DateRange,
  Visibility,
  VisibilityOff,
  History,
  Assignment,
  ArrowBack
} from '@mui/icons-material';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import ReportHeaderModal from './ReportHeaderModal';
import HistoryModal from './HistoryModal';
import { useTheme } from '../../contexts/ThemeContext';
import { analyzeDuvalTriangles } from '../../utils/duvalAnalysis';
import { analyzeCOLevel } from '../../utils/coAnalysis';
import { generateDGAPDF } from '../../utils/pdfGenerator';
import { FAULT_RECOMMENDATIONS } from '../../data/faultRecommendations';
import type { AnalysisResult } from '../../utils/duvalAnalysis';
import type { 
  GasConcentration, 
  Triangle1Fault, 
  Triangle4Fault, 
  Triangle5Fault, 
  FaultRecommendationConfig,
  DataClassification,
  COAnalysisResult,
  ExportConfig,
  FilterConfig,
  SortConfig,
  ManualTriangleData,
  TriangleImage,
  ReportHeader,
  AnalysisHistory
} from '../../types';

interface ManualAnalysisState {
  triangles: ManualTriangleData[];
  overallResult: AnalysisResult | null;
  clipboardSupported: boolean;
  showExportModal: boolean;
  showFilterModal: boolean;
  showReportHeaderModal: boolean;
  showHistoryModal: boolean;
  exportConfig: ExportConfig;
  filterConfig: FilterConfig;
  sortConfig: SortConfig;
  reportHeader: ReportHeader | null;
  pendingExport: boolean;
}

// Complete gas parameter list
const ALL_GAS_PARAMETERS: (keyof GasConcentration)[] = [
  'h2', 'ch4', 'c2h6', 'c2h4', 'c2h2', 'co', 'co2', 'o2', 'n2', 
  'o2_n2_ratio', 'co2_co_ratio', 'gas_by_volume', 'nel_oil', 'nel_paper'
];

// Gas labels for display
const GAS_LABELS: Record<keyof GasConcentration, string> = {
  h2: 'Hydrogen (H2)',
  ch4: 'Methane (CH4)',
  c2h6: 'Ethane (C2H6)',
  c2h4: 'Ethylene (C2H4)',
  c2h2: 'Acetylene (C2H2)',
  co: 'Carbon Monoxide (CO)',
  co2: 'Carbon Dioxide (CO2)',
  o2: 'Oxygen (O2)',
  n2: 'Nitrogen (N2)',
  o2_n2_ratio: 'O2/N2',
  co2_co_ratio: 'CO2/CO',
  gas_by_volume: '% Gas by Volume',
  nel_oil: 'NEL Oil',
  nel_paper: 'NEL Paper'
};

// Data classification options
const DATA_CLASSIFICATIONS: DataClassification[] = [
  'Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5', 'Data 6', 'Data 7', 'Data 8'
];

// Fault options for each triangle
const TRIANGLE_1_FAULTS: Triangle1Fault[] = ['PD', 'D1', 'D2', 'T1', 'T2', 'T3', 'DT'];
const TRIANGLE_4_FAULTS: Triangle4Fault[] = ['S', 'PD', 'ND', 'DT', 'C', 'D2'];
const TRIANGLE_5_FAULTS: Triangle5Fault[] = ['O', 'S', 'ND', 'C', 'T2', 'T3'];

interface DuvalAnalysisProps {
  onBack?: () => void;
}

const DuvalAnalysis: React.FC<DuvalAnalysisProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [analysisState, setAnalysisState] = useState<ManualAnalysisState>({
    triangles: [],
    overallResult: null,
    clipboardSupported: false,
    showExportModal: false,
    showFilterModal: false,
    showReportHeaderModal: false,
    showHistoryModal: false,
    exportConfig: {
      includeImages: true,
      includeGasData: true,
      includeRecommendations: true,
      triangleSelection: [1, 4, 5]
    },
    filterConfig: {},
    sortConfig: {
      field: 'date',
      direction: 'desc'
    },
    reportHeader: null,
    pendingExport: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check clipboard API support
  useEffect(() => {
    const checkClipboardSupport = () => {
      const isSupported = navigator.clipboard && 'read' in navigator.clipboard;
      setAnalysisState(prev => ({ ...prev, clipboardSupported: isSupported }));
    };
    
    checkClipboardSupport();
  }, []);

  // Clipboard paste event listener
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      event.preventDefault();
      
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            await handleClipboardImage(blob);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Handle clipboard image
  const handleClipboardImage = async (blob: Blob) => {
    try {
      const timestamp = Date.now();
      const imageUrl = URL.createObjectURL(blob);
      
      // Check if there are existing triangles without images
      const trianglesWithoutImages = analysisState.triangles.filter(t => t.images.length === 0);
      
      if (trianglesWithoutImages.length > 0) {
        // Add to first triangle without image
        const targetTriangle = trianglesWithoutImages[0];
        const newImage: TriangleImage = {
          id: `img-${timestamp}`,
          imageUrl,
          source: 'clipboard',
          filename: 'clipboard-paste',
          uploadedAt: new Date()
        };
        
        setAnalysisState(prev => ({
          ...prev,
          triangles: prev.triangles.map(t =>
            t.id === targetTriangle.id 
              ? { ...t, images: [...t.images, newImage] }
              : t
          )
        }));
        showToast(`Gambar ditambahkan ke Triangle ${targetTriangle.triangleMethod}!`, 'success');
      } else if (analysisState.triangles.length > 0) {
        // Add to last triangle (allow multiple images per triangle)
        const lastTriangle = analysisState.triangles[analysisState.triangles.length - 1];
        const newImage: TriangleImage = {
          id: `img-${timestamp}`,
          imageUrl,
          source: 'clipboard',
          filename: 'clipboard-paste',
          uploadedAt: new Date()
        };
        
        setAnalysisState(prev => ({
          ...prev,
          triangles: prev.triangles.map(t =>
            t.id === lastTriangle.id 
              ? { ...t, images: [...t.images, newImage] }
              : t
          )
        }));
        showToast(`Gambar ditambahkan ke Triangle ${lastTriangle.triangleMethod}!`, 'success');
      } else {
        // No triangles exist, suggest adding one
        showToast('Tambahkan triangle terlebih dahulu, lalu paste gambar!', 'info');
      }
      
    } catch (error) {
      console.error('Clipboard paste error:', error);
      showToast('Gagal memproses gambar dari clipboard', 'error');
    }
  };

  // Paste from clipboard button handler
  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard) {
        showToast('Clipboard tidak didukung di browser ini', 'error');
        return;
      }

      const items = await navigator.clipboard.read();
      
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/')) || '');
          await handleClipboardImage(blob);
          return;
        }
      }
      
      showToast('Tidak ada gambar ditemukan di clipboard', 'error');
    } catch (error) {
      console.error('Clipboard read error:', error);
      showToast('Gagal membaca clipboard. Gunakan Ctrl+V sebagai alternatif.', 'error');
    }
  };

  // Paste to specific triangle
  const handlePasteToTriangle = async (triangleId: string) => {
    try {
      if (!navigator.clipboard) {
        showToast('Clipboard tidak didukung di browser ini', 'error');
        return;
      }

      const items = await navigator.clipboard.read();
      
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/')) || '');
          const imageUrl = URL.createObjectURL(blob);
          
          const newImage: TriangleImage = {
            id: `img-${Date.now()}`,
            imageUrl,
            source: 'clipboard',
            filename: 'clipboard-paste',
            uploadedAt: new Date()
          };
          
          setAnalysisState(prev => ({
            ...prev,
            triangles: prev.triangles.map(t =>
              t.id === triangleId 
                ? { ...t, images: [...t.images, newImage] }
                : t
            )
          }));
          
          showToast('Gambar dari clipboard berhasil ditambahkan!', 'success');
          return;
        }
      }
      
      showToast('Tidak ada gambar ditemukan di clipboard', 'error');
    } catch (error) {
      console.error('Clipboard read error:', error);
      showToast('Gagal membaca clipboard', 'error');
    }
  };

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

  // Add new triangle
  const addTriangle = (method: 1 | 4 | 5, imageUrl?: string, source: 'file' | 'clipboard' = 'file') => {
    const newTriangle: ManualTriangleData = {
      id: `triangle-${method}-${Date.now()}`,
      triangleMethod: method,
      dataClassification: 'Data 1', // Default to Data 1
      images: imageUrl ? [{
        id: `img-${Date.now()}`,
        imageUrl,
        source,
        filename: source === 'file' ? 'uploaded-file' : 'clipboard-paste',
        uploadedAt: new Date()
      }] : [],
      gasConcentrations: {},
      selectedFault: null,
      coAnalysisResult: null,
      isCompleted: false,
      createdAt: new Date(),
      lastModified: new Date()
    };

    setAnalysisState(prev => ({
      ...prev,
      triangles: [...prev.triangles, newTriangle]
    }));
  };

  // Handle file upload for specific triangle
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, triangleId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: TriangleImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = URL.createObjectURL(file);
      newImages.push({
        id: `img-${Date.now()}-${i}`,
        imageUrl,
        source: 'file',
        filename: file.name,
        uploadedAt: new Date()
      });
    }

    setAnalysisState(prev => ({
      ...prev,
      triangles: prev.triangles.map(t =>
        t.id === triangleId 
          ? { ...t, images: [...t.images, ...newImages] }
          : t
      )
    }));
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update data classification
  const updateDataClassification = (triangleId: string, classification: DataClassification) => {
    setAnalysisState(prev => ({
      ...prev,
      triangles: prev.triangles.map(triangle =>
        triangle.id === triangleId
          ? {
              ...triangle,
              dataClassification: classification,
              selectedFault: null,
              coAnalysisResult: null,
              isCompleted: false,
              lastModified: new Date()
            }
          : triangle
      )
    }));
  };

  // Update gas concentration
  const updateGasConcentration = (triangleId: string, gas: keyof GasConcentration, value: number) => {
    setAnalysisState(prev => ({
      ...prev,
      triangles: prev.triangles.map(triangle =>
        triangle.id === triangleId
          ? {
              ...triangle,
              gasConcentrations: {
                ...triangle.gasConcentrations,
                [gas]: value
              },
              lastModified: new Date()
            }
          : triangle
      )
    }));

    // Auto-analyze for Data 1 when CO is updated
    const triangle = analysisState.triangles.find(t => t.id === triangleId);
    if (triangle?.dataClassification === 'Data 1' && gas === 'co' && value > 0) {
      const coAnalysisResult = analyzeCOLevel(value);
      setAnalysisState(prev => ({
        ...prev,
        triangles: prev.triangles.map(t =>
          t.id === triangleId
            ? {
                ...t,
                coAnalysisResult,
                isCompleted: true,
                lastModified: new Date()
              }
            : t
        )
      }));
      updateOverallAnalysis();
    }
  };

  // Update fault selection (for Data 2+)
  const updateFaultSelection = (triangleId: string, fault: string) => {
    setAnalysisState(prev => ({
      ...prev,
      triangles: prev.triangles.map(triangle =>
        triangle.id === triangleId
          ? {
              ...triangle,
              selectedFault: fault,
              isCompleted: true,
              lastModified: new Date()
            }
          : triangle
      )
    }));
    
    updateOverallAnalysis();
  };

  // Remove triangle
  const removeTriangle = (triangleId: string) => {
    setAnalysisState(prev => ({
      ...prev,
      triangles: prev.triangles.filter(t => t.id !== triangleId)
    }));
    updateOverallAnalysis();
  };

  // Update overall analysis
  const updateOverallAnalysis = () => {
    setTimeout(() => {
      setAnalysisState(prev => {
        const completedTriangles = prev.triangles.filter(t => t.isCompleted);
        
        if (completedTriangles.length === 0) {
          return { ...prev, overallResult: null };
        }

        // Create combined gas concentrations
        const combinedGasConcentrations: Partial<GasConcentration> = {};
        
        completedTriangles.forEach(triangle => {
          Object.entries(triangle.gasConcentrations).forEach(([gas, value]) => {
            if (value && value > 0) {
              combinedGasConcentrations[gas as keyof GasConcentration] = 
                (combinedGasConcentrations[gas as keyof GasConcentration] || 0) + value;
            }
          });
        });

        // Average the values
        Object.keys(combinedGasConcentrations).forEach(gas => {
          const key = gas as keyof GasConcentration;
          combinedGasConcentrations[key] = 
            (combinedGasConcentrations[key] || 0) / completedTriangles.length;
        });

        // Generate analysis result based on manual selections
        const analysisResult = generateManualAnalysisResult(completedTriangles, combinedGasConcentrations);

        return {
          ...prev,
          overallResult: analysisResult
        };
      });
    }, 100); // Small delay to ensure state is updated
  };

  // Generate analysis result from manual inputs
  const generateManualAnalysisResult = (triangles: ManualTriangleData[], gasConcentrations: Partial<GasConcentration>): AnalysisResult => {
    const faultTypes = triangles.map(t => t.selectedFault).filter(Boolean);
    const uniqueFaults = [...new Set(faultTypes)];
    
    // Determine severity
    const criticalFaults = ['D2', 'T3'];
    const highFaults = ['D1', 'DT', 'T2'];
    const mediumFaults = ['T1', 'C', 'PD'];
    
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (uniqueFaults.some(f => criticalFaults.includes(f!))) {
      severity = 'critical';
    } else if (uniqueFaults.some(f => highFaults.includes(f!))) {
      severity = 'high';
    } else if (uniqueFaults.some(f => mediumFaults.includes(f!))) {
      severity = 'medium';
    }
    
    // Generate recommendation
    let overallRecommendation = '';
    if (uniqueFaults.includes('D2')) {
      overallRecommendation = 'CRITICAL: Terdeteksi High Energy Discharge (D2). Segera lakukan shutdown dan inspeksi internal transformator.';
    } else if (uniqueFaults.includes('T3')) {
      overallRecommendation = 'CRITICAL: Terdeteksi Thermal Fault >700°C (T3). Segera lakukan shutdown dan perbaikan komprehensif.';
    } else if (uniqueFaults.includes('D1')) {
      overallRecommendation = 'HIGH: Terdeteksi Low Energy Discharge (D1). Lakukan inspeksi mendalam dan perbaikan isolasi.';
    } else if (uniqueFaults.includes('T2')) {
      overallRecommendation = 'HIGH: Terdeteksi Thermal Fault 300-700°C (T2). Periksa sistem pendingin dan beban operasi.';
    } else if (uniqueFaults.includes('T1')) {
      overallRecommendation = 'MEDIUM: Terdeteksi Thermal Fault <300°C (T1). Tingkatkan monitoring dan periksa hotspot.';
    } else if (uniqueFaults.includes('PD')) {
      overallRecommendation = 'MEDIUM: Terdeteksi Partial Discharge (PD). Lakukan pengukuran PD dan periksa isolasi.';
    } else {
      overallRecommendation = 'Analisis manual selesai. Tindak lanjuti sesuai fault yang terdeteksi.';
    }

    // Get recommendations from fault types
    const recommendations: FaultRecommendationConfig[] = [];
    uniqueFaults.forEach(faultType => {
      if (faultType && FAULT_RECOMMENDATIONS[faultType as keyof typeof FAULT_RECOMMENDATIONS]) {
        recommendations.push(FAULT_RECOMMENDATIONS[faultType as keyof typeof FAULT_RECOMMENDATIONS]);
      }
    });

    // If no faults detected, add normal condition recommendation
    if (uniqueFaults.length === 0) {
      recommendations.push(FAULT_RECOMMENDATIONS.NORMAL);
    }

    // Build triangle results
    const triangle1 = triangles.find(t => t.triangleMethod === 1);
    const triangle4 = triangles.find(t => t.triangleMethod === 4);
    const triangle5 = triangles.find(t => t.triangleMethod === 5);

    return {
      triangle1: triangle1?.isCompleted ? {
        triangleMethod: 1,
        faultType: triangle1.selectedFault as any,
        confidence: 1.0, // Manual input = 100% confidence
        coordinates: { x: 0, y: 0 },
        gasRatios: { gas1: 0, gas2: 0, gas3: 0 }
      } : undefined,
      triangle4: triangle4?.isCompleted ? {
        triangleMethod: 4,
        faultType: triangle4.selectedFault as any,
        confidence: 1.0,
        coordinates: { x: 0, y: 0 },
        gasRatios: { gas1: 0, gas2: 0, gas3: 0 }
      } : undefined,
      triangle5: triangle5?.isCompleted ? {
        triangleMethod: 5,
        faultType: triangle5.selectedFault as any,
        confidence: 1.0,
        coordinates: { x: 0, y: 0 },
        gasRatios: { gas1: 0, gas2: 0, gas3: 0 }
      } : undefined,
      overallRecommendation,
      recommendations,
      severity
    };
  };

  const resetAnalysis = () => {
    setAnalysisState(prev => ({
      ...prev,
      triangles: [],
      overallResult: null
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon className="w-6 h-6 text-red-600" />;
      case 'high': return <Warning className="w-6 h-6 text-orange-600" />;
      case 'medium': return <Warning className="w-6 h-6 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-6 h-6 text-green-600" />;
      default: return <Analytics className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRequiredGases = (method: 1 | 4 | 5): (keyof GasConcentration)[] => {
    switch (method) {
      case 1: return ['ch4', 'c2h4', 'c2h2'];
      case 4: return ['h2', 'ch4', 'c2h6'];
      case 5: return ['ch4', 'c2h4', 'c2h6'];
      default: return [];
    }
  };

  const getFaultOptions = (method: 1 | 4 | 5) => {
    switch (method) {
      case 1: return TRIANGLE_1_FAULTS;
      case 4: return TRIANGLE_4_FAULTS;
      case 5: return TRIANGLE_5_FAULTS;
      default: return [];
    }
  };

  const getSourceIcon = (source: 'file' | 'clipboard') => {
    return source === 'clipboard' ? (
      <ContentPaste className="w-4 h-4 text-blue-500" />
    ) : (
      <CloudUpload className="w-4 h-4 text-green-500" />
    );
  };

  // Handle report header submission
  const handleReportHeaderSubmit = async (reportHeader: ReportHeader) => {
    setAnalysisState(prev => ({
      ...prev,
      reportHeader,
      showReportHeaderModal: false,
      pendingExport: false
    }));

    // Now proceed with export
    await executeExport(reportHeader);
  };

  // Execute PDF export
  const executeExport = async (reportHeader: ReportHeader) => {
    const { exportConfig } = analysisState;
    
    // Filter triangles based on selection
    const trianglesToExport = analysisState.triangles.filter(t => 
      exportConfig.triangleSelection.includes(t.triangleMethod) && t.isCompleted
    );

    if (trianglesToExport.length === 0) {
      showToast('Tidak ada data yang dipilih untuk export', 'error');
      return;
    }

    try {
      // Generate PDF using the utility
      await generateDGAPDF({
        reportHeader,
        triangles: trianglesToExport,
        overallResult: analysisState.overallResult,
        includeImages: exportConfig.includeImages,
        includeGasData: exportConfig.includeGasData,
        includeRecommendations: exportConfig.includeRecommendations
      });

      // Mark as exported in history
      const exportedAnalysis: AnalysisHistory = {
        id: Date.now().toString(),
        triangles: trianglesToExport,
        overallResult: analysisState.overallResult,
        reportHeader,
        createdAt: new Date(),
        exportedAt: new Date()
      };

      const existingHistory = JSON.parse(localStorage.getItem('dgaAnalysisHistory') || '[]');
      existingHistory.push(exportedAnalysis);
      localStorage.setItem('dgaAnalysisHistory', JSON.stringify(existingHistory));

      showToast(`PDF berhasil di-export untuk ${trianglesToExport.length} triangle(s)`, 'success');
    } catch (error) {
      console.error('PDF Export Error:', error);
      showToast('Gagal mengexport PDF', 'error');
    }
    
    setAnalysisState(prev => ({ ...prev, showExportModal: false }));
  };

  // Export to PDF - Updated to show report header modal first
  const handleExportPDF = () => {
    const { exportConfig } = analysisState;
    
    const trianglesToExport = analysisState.triangles.filter(t => 
      exportConfig.triangleSelection.includes(t.triangleMethod) && t.isCompleted
    );

    if (trianglesToExport.length === 0) {
      showToast('Tidak ada data yang dipilih untuk export', 'error');
      return;
    }

    // Show report header modal first
    setAnalysisState(prev => ({
      ...prev,
      showExportModal: false,
      showReportHeaderModal: true,
      pendingExport: true
    }));
  };

  // Load history analysis
  const handleLoadHistory = (history: AnalysisHistory) => {
    setAnalysisState(prev => ({
      ...prev,
      triangles: history.triangles.map(triangle => ({
        ...triangle,
        createdAt: new Date(triangle.createdAt),
        lastModified: new Date(triangle.lastModified),
        images: triangle.images?.map(img => ({
          ...img,
          uploadedAt: img.uploadedAt ? new Date(img.uploadedAt) : new Date()
        })) || []
      })),
      overallResult: history.overallResult,
      reportHeader: history.reportHeader || null
    }));

    showToast('Riwayat analisis berhasil dimuat', 'success');
    updateOverallAnalysis();
  };

  // Save analysis results
  const handleSaveResults = () => {
    const completedTriangles = analysisState.triangles.filter(t => t.isCompleted);
    
    if (completedTriangles.length === 0) {
      showToast('Tidak ada analisis yang selesai untuk disimpan', 'error');
      return;
    }

    // Save to localStorage (in real app, would save to database)
    const savedData: AnalysisHistory = {
      id: Date.now().toString(),
      triangles: completedTriangles,
      overallResult: analysisState.overallResult,
      reportHeader: analysisState.reportHeader || undefined,
      createdAt: new Date()
    };

    const existingSaves = JSON.parse(localStorage.getItem('dgaAnalysisHistory') || '[]');
    existingSaves.push(savedData);
    localStorage.setItem('dgaAnalysisHistory', JSON.stringify(existingSaves));

    showToast(`${completedTriangles.length} analisis berhasil disimpan`, 'success');
  };

  // Apply filters and sorting
  const getFilteredAndSortedTriangles = () => {
    let filtered = [...analysisState.triangles];

    // Apply filters
    if (analysisState.filterConfig.triangleMethod) {
      filtered = filtered.filter(t => t.triangleMethod === analysisState.filterConfig.triangleMethod);
    }
    
    if (analysisState.filterConfig.dataClassification) {
      filtered = filtered.filter(t => t.dataClassification === analysisState.filterConfig.dataClassification);
    }

    if (analysisState.filterConfig.dateRange) {
      const { start, end } = analysisState.filterConfig.dateRange;
      filtered = filtered.filter(t => 
        t.createdAt >= start && t.createdAt <= end
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = analysisState.sortConfig;
      let aValue: any, bValue: any;

      switch (field) {
        case 'date':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'triangle':
          aValue = a.triangleMethod;
          bValue = b.triangleMethod;
          break;
        case 'severity':
          aValue = a.dataClassification === 'Data 1' 
            ? a.coAnalysisResult?.severity || 'LOW'
            : a.selectedFault || '';
          bValue = b.dataClassification === 'Data 1'
            ? b.coAnalysisResult?.severity || 'LOW'
            : b.selectedFault || '';
          break;
        case 'dataClassification':
          aValue = a.dataClassification;
          bValue = b.dataClassification;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } pt-20 p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Science className={`w-12 h-12 mr-4 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 to-purple-400' 
                : 'from-blue-600 to-indigo-600'
            } bg-clip-text text-transparent`}>
              Dissolved Gas Analysis
            </h1>
          </div>
          <p className={`text-lg max-w-3xl mx-auto ${
            isDark ? 'text-dark-muted' : 'text-gray-600'
          }`}>
            IEEE C57.104-2019 Standard - Duval Triangle Method
          </p>
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-dark-muted' : 'text-gray-500'
            }`}>
              <Edit className="w-4 h-4" />
              <span>Manual Input</span>
            </div>
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-dark-muted' : 'text-gray-500'
            }`}>
              <FilterList className="w-4 h-4" />
              <span>Select Fault Type</span>
            </div>
            <div className={`flex items-center space-x-2 ${
              isDark ? 'text-dark-muted' : 'text-gray-500'
            }`}>
              <ContentPaste className="w-4 h-4" />
              <span>Screenshot Support</span>
            </div>
          </div>
        </motion.div>

        {/* Add Triangle Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl shadow-xl p-8 mb-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-dark-card border-dark-border' 
              : 'bg-white border-gray-100'
          }`}
        >
          <h3 className={`text-xl font-bold text-center mb-6 ${
            isDark ? 'text-dark-text' : 'text-gray-800'
          }`}>
            Pilih Triangle Method untuk Analisis
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Triangle 1 */}
            <div className="text-center">
              <div className={`rounded-xl p-6 border mb-4 transition-colors duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/30' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
              }`}>
                <h4 className={`font-bold mb-2 ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                }`}>Triangle 1</h4>
                <p className={`text-sm mb-3 ${
                  isDark ? 'text-dark-muted' : 'text-gray-600'
                }`}>CH4, C2H4, C2H2</p>
                <p className={`text-xs ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>Faults: PD, D1, D2, T1, T2, T3, DT</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => addTriangle(1)}
                className="w-full"
              >
                <Add className="w-4 h-4 mr-2" />
                Tambah Triangle 1
              </Button>
            </div>

            {/* Triangle 4 */}
            <div className="text-center">
              <div className={`rounded-xl p-6 border mb-4 transition-colors duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              }`}>
                <h4 className={`font-bold mb-2 ${
                  isDark ? 'text-green-300' : 'text-green-800'
                }`}>Triangle 4</h4>
                <p className={`text-sm mb-3 ${
                  isDark ? 'text-dark-muted' : 'text-gray-600'
                }`}>H2, CH4, C2H6</p>
                <p className={`text-xs ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>Faults: S, PD, ND, DT, C, D2</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => addTriangle(4)}
                className="w-full"
              >
                <Add className="w-4 h-4 mr-2" />
                Tambah Triangle 4
              </Button>
            </div>

            {/* Triangle 5 */}
            <div className="text-center">
              <div className={`rounded-xl p-6 border mb-4 transition-colors duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-900/20 to-violet-900/20 border-purple-700/30' 
                  : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200'
              }`}>
                <h4 className={`font-bold mb-2 ${
                  isDark ? 'text-purple-300' : 'text-purple-800'
                }`}>Triangle 5</h4>
                <p className={`text-sm mb-3 ${
                  isDark ? 'text-dark-muted' : 'text-gray-600'
                }`}>CH4, C2H4, C2H6</p>
                <p className={`text-xs ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>Faults: O, S, ND, C, T2, T3</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => addTriangle(5)}
                className="w-full"
              >
                <Add className="w-4 h-4 mr-2" />
                Tambah Triangle 5
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Triangle Input Forms */}
        {analysisState.triangles.length > 0 && (
          <div className="space-y-6 mb-8">
            {/* Filter and Sort Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl shadow-lg p-4 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-dark-card border-dark-border' 
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAnalysisState(prev => ({ ...prev, showFilterModal: true }))}
                >
                  <FilterList className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                
                <select
                  value={`${analysisState.sortConfig.field}-${analysisState.sortConfig.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-') as [any, 'asc' | 'desc'];
                    setAnalysisState(prev => ({
                      ...prev,
                      sortConfig: { field, direction }
                    }));
                  }}
                  className={`px-3 py-1 border rounded-lg text-sm transition-colors duration-300 ${
                    isDark 
                      ? 'border-dark-border bg-dark-surface text-dark-text' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="date-desc">Terbaru</option>
                  <option value="date-asc">Terlama</option>
                  <option value="triangle-asc">Triangle 1-5</option>
                  <option value="triangle-desc">Triangle 5-1</option>
                  <option value="severity-desc">Severity Tinggi</option>
                  <option value="dataClassification-asc">Data 1-8</option>
                </select>

                <div className={`text-sm ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                  {getFilteredAndSortedTriangles().length} dari {analysisState.triangles.length} triangle
                </div>
              </div>
            </motion.div>

            {getFilteredAndSortedTriangles().map((triangle, index) => (
              <motion.div
                key={triangle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl shadow-xl p-6 border transition-colors duration-300 ${
                  isDark 
                    ? 'bg-dark-card border-dark-border' 
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-dark-text' : 'text-gray-800'
                    }`}>
                      Triangle {triangle.triangleMethod} - {triangle.dataClassification}
                    </h3>
                    <div className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {triangle.createdAt.toLocaleDateString('id-ID')} • {triangle.createdAt.toLocaleTimeString('id-ID')}
                    </div>
                  </div>
                  <button
                    onClick={() => removeTriangle(triangle.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark 
                        ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' 
                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                    }`}
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Data Classification */}
                  <div>
                    <h4 className={`font-semibold mb-4 ${
                      isDark ? 'text-dark-text' : 'text-gray-700'
                    }`}>Data Classification</h4>
                    <select
                      value={triangle.dataClassification}
                      onChange={(e) => updateDataClassification(triangle.id, e.target.value as DataClassification)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent mb-4 transition-colors duration-300 ${
                        isDark 
                          ? 'border-dark-border bg-dark-surface text-dark-text' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      {DATA_CLASSIFICATIONS.map(classification => (
                        <option key={classification} value={classification}>
                          {classification}
                        </option>
                      ))}
                    </select>

                    {/* Image Upload */}
                    <div>
                      <h4 className={`font-semibold mb-4 ${
                        isDark ? 'text-dark-text' : 'text-gray-700'
                      }`}>Upload Gambar (Opsional)</h4>
                      {triangle.images.length > 0 ? (
                        <div className="space-y-3">
                          <div className={`text-sm font-medium border-b pb-2 ${
                            isDark ? 'text-dark-text border-dark-border' : 'text-gray-700 border-gray-200'
                          }`}>
                            📎 Attached Images ({triangle.images.length})
                                  </div>
                          
                          {triangle.images.map((img, imgIndex) => (
                            <div key={img.id} className={`p-3 border rounded ${
                              isDark ? 'border-dark-border bg-dark-surface' : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium ${
                                  isDark ? 'text-dark-text' : 'text-gray-900'
                                }`}>
                                  Image {imgIndex + 1} ({img.source === 'clipboard' ? 'Clipboard' : 'File'})
                                </span>
                                  <button
                                    onClick={() => {
                                      setAnalysisState(prev => ({
                                        ...prev,
                                        triangles: prev.triangles.map(t =>
                                          t.id === triangle.id ? {
                                            ...t,
                                            images: t.images.filter(i => i.id !== img.id)
                                          } : t
                                        )
                                      }));
                                    }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Delete Image"
                                  >
                                  <Delete className="w-4 h-4" />
                                  </button>
                                </div>
                              
                              <img
                                src={img.imageUrl}
                                alt={`Triangle ${triangle.triangleMethod} - Image ${imgIndex + 1}`}
                                className="w-full border rounded"
                                style={{ maxHeight: '200px', objectFit: 'contain' }}
                              />
                              
                              <div className={`text-xs mt-2 ${
                                isDark ? 'text-dark-muted' : 'text-gray-500'
                              }`}>
                                Uploaded: {img.uploadedAt instanceof Date 
                                    ? img.uploadedAt.toLocaleDateString('id-ID')
                                    : new Date(img.uploadedAt).toLocaleDateString('id-ID')
                                  }
                                </div>
                              </div>
                            ))}

                          {/* Add More Images */}
                          <div className="flex gap-2 pt-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, triangle.id)}
                                className="hidden"
                                id={`add-file-${triangle.id}`}
                                multiple
                              />
                              <label
                                htmlFor={`add-file-${triangle.id}`}
                              className={`flex-1 text-center py-2 px-3 border rounded cursor-pointer text-sm ${
                                isDark
                                  ? 'border-dark-border hover:bg-dark-surface text-dark-text'
                                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                              >
                              <CloudUpload className="w-4 h-4 inline mr-2" />
                              Add Files
                              </label>
                            
                            <button
                              onClick={() => handlePasteToTriangle(triangle.id)}
                              className={`py-2 px-3 border rounded text-sm ${
                                isDark
                                  ? 'border-green-600 bg-green-700 text-white hover:bg-green-600'
                                  : 'border-green-300 bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              <ContentPaste className="w-4 h-4 inline mr-1" />
                              Paste
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${
                            isDark 
                              ? 'border-dark-border hover:border-primary-accent hover:bg-dark-surface/50' 
                              : 'border-gray-300 hover:border-primary-accent hover:bg-blue-50'
                          }`}>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, triangle.id)}
                              className="hidden"
                              id={`file-${triangle.id}`}
                              multiple
                            />
                            <label htmlFor={`file-${triangle.id}`} className="cursor-pointer">
                              <CloudUpload className={`w-8 h-8 mx-auto mb-2 ${
                                isDark ? 'text-dark-muted' : 'text-gray-400'
                              }`} />
                              <p className={`text-sm mb-1 ${
                                isDark ? 'text-dark-text' : 'text-gray-500'
                              }`}>Upload Files</p>
                              <p className={`text-xs ${
                                isDark ? 'text-dark-muted' : 'text-gray-400'
                              }`}>Drag & drop or click to browse</p>
                            </label>
                          </div>
                          
                          <div className="text-center">
                            <span className={`text-xs mb-2 block ${
                              isDark ? 'text-dark-muted' : 'text-gray-500'
                            }`}>or</span>
                            <button
                              onClick={() => handlePasteToTriangle(triangle.id)}
                              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                                isDark 
                                  ? 'bg-green-900/20 hover:bg-green-900/40 text-green-400' 
                                  : 'bg-green-100 hover:bg-green-200 text-green-700'
                              }`}
                            >
                              <ContentPaste className="w-4 h-4 mr-2" />
                              Paste Screenshot
                            </button>
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-dark-muted' : 'text-gray-500'
                            }`}>Print Screen → Ctrl+V</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gas Input */}
                  <div>
                    <h4 className={`font-semibold mb-4 ${
                      isDark ? 'text-dark-text' : 'text-gray-700'
                    }`}>
                      Input Data Gas
                    </h4>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {ALL_GAS_PARAMETERS.map(gas => {
                        const isHighlighted = getRequiredGases(triangle.triangleMethod).includes(gas);
                        return (
                          <div 
                            key={gas} 
                            className={`flex items-center space-x-2 p-2 rounded transition-colors duration-300 ${
                              isHighlighted 
                                ? isDark 
                                  ? 'bg-blue-900/20 border border-blue-700/30' 
                                  : 'bg-blue-50 border border-blue-200'
                                : isDark
                                  ? 'bg-dark-surface/50'
                                  : 'bg-gray-50/50'
                            }`}
                          >
                            <label className={`w-20 text-xs font-medium ${
                              isHighlighted 
                                ? isDark ? 'text-blue-300' : 'text-blue-700'
                                : isDark ? 'text-dark-muted' : 'text-gray-600'
                            }`}>
                              {gas.toUpperCase()}:
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              value={triangle.gasConcentrations[gas] || ''}
                              onChange={(e) => updateGasConcentration(
                                triangle.id, 
                                gas, 
                                parseFloat(e.target.value) || 0
                              )}
                              className={`flex-1 px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-primary-accent focus:border-transparent transition-colors duration-300 ${
                                isDark 
                                  ? 'border-dark-border bg-dark-surface text-dark-text' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                            <span className={`text-xs w-8 ${
                              isDark ? 'text-dark-muted' : 'text-gray-500'
                            }`}>
                              {gas.includes('ratio') || gas.includes('volume') ? '%' : 'ppm'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className={`mt-4 text-xs ${
                      isDark ? 'text-dark-muted' : 'text-gray-500'
                    }`}>
                      <strong>Highlighted:</strong> Required for Triangle {triangle.triangleMethod}
                    </div>
                  </div>

                  {/* Analysis & Results */}
                  <div>
                    {triangle.dataClassification === 'Data 1' ? (
                      // CO Analysis for Data 1
                      <div>
                        <h4 className={`font-semibold mb-4 ${
                          isDark ? 'text-dark-text' : 'text-gray-700'
                        }`}>CO Analysis (Data 1)</h4>
                        {triangle.coAnalysisResult ? (
                          <div className={`p-4 rounded-lg border ${
                            triangle.coAnalysisResult.severity === 'HIGH' 
                              ? isDark ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                              : triangle.coAnalysisResult.severity === 'MEDIUM' 
                                ? isDark ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                : isDark ? 'bg-green-900/20 border-green-700/30 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
                          }`}>
                            <div className="font-bold text-sm mb-2">
                              {triangle.coAnalysisResult.description}
                            </div>
                            <div className={`text-xs mb-2 ${
                              isDark ? 'text-dark-muted' : 'text-gray-600'
                            }`}>
                              CO Level: {triangle.coAnalysisResult.coLevel} ppm
                            </div>
                            <div className={`text-xs ${
                              isDark ? 'text-dark-muted' : 'text-gray-600'
                            }`}>
                              Resampling: {triangle.coAnalysisResult.resamplingInterval}
                            </div>
                          </div>
                        ) : (
                          <div className={`text-sm ${
                            isDark ? 'text-dark-muted' : 'text-gray-500'
                          }`}>
                            Input CO value untuk analisis otomatis
                          </div>
                        )}
                      </div>
                    ) : (
                      // Fault Selection for Data 2+
                      <div>
                        <h4 className={`font-semibold mb-4 ${
                          isDark ? 'text-dark-text' : 'text-gray-700'
                        }`}>
                          Pilih Fault Type (Data 2+)
                        </h4>
                        <select
                          value={triangle.selectedFault || ''}
                          onChange={(e) => updateFaultSelection(triangle.id, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent mb-4 transition-colors duration-300 ${
                            isDark 
                              ? 'border-dark-border bg-dark-surface text-dark-text' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          <option value="">-- Pilih Fault --</option>
                          {getFaultOptions(triangle.triangleMethod).map(fault => (
                            <option key={fault} value={fault}>
                              {fault}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Completion Status */}
                    {triangle.isCompleted && (
                      <div className={`mt-4 p-3 border rounded-lg ${
                        isDark 
                          ? 'bg-green-900/20 border-green-700/30' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className={`flex items-center ${
                          isDark ? 'text-green-400' : 'text-green-700'
                        }`}>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium text-sm">
                            Triangle {triangle.triangleMethod} - {
                              triangle.dataClassification === 'Data 1' 
                                ? triangle.coAnalysisResult?.severity
                                : triangle.selectedFault
                            } (Selesai)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Overall Analysis Results */}
        <AnimatePresence>
          {analysisState.overallResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Combined Analysis Results */}
              <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
                isDark 
                  ? 'bg-dark-card border border-dark-border' 
                  : 'bg-white border border-gray-100'
              }`}>
                <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                  isDark ? 'text-dark-text' : 'text-gray-900'
                }`}>
                  <Analytics className={`w-8 h-8 mr-3 ${
                    isDark ? 'text-blue-400' : 'text-primary-accent'
                  }`} />
                  Hasil Analisis Manual Multi-Triangle
                </h3>

                {/* Overall Recommendation */}
                <div className={`p-6 rounded-xl border mb-6 ${getSeverityColor(analysisState.overallResult.severity)}`}>
                  <div className="flex items-start">
                    {getSeverityIcon(analysisState.overallResult.severity)}
                    <div className="ml-4">
                      <h4 className="font-bold text-lg mb-2">
                        Rekomendasi Utama ({analysisState.overallResult.severity.toUpperCase()})
                      </h4>
                      <p className="leading-relaxed">
                        {analysisState.overallResult.overallRecommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Triangle Results */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Triangle 1 */}
                  {analysisState.overallResult.triangle1 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-lg mb-3 text-blue-800">Triangle 1</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">CH4, C2H4, C2H2</div>
                        <div className="text-lg font-bold text-blue-600">
                          {analysisState.overallResult.triangle1.faultType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Manual Input (100% Accurate)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Triangle 4 */}
                  {analysisState.overallResult.triangle4 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h4 className="font-bold text-lg mb-3 text-green-800">Triangle 4</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">H2, CH4, C2H6</div>
                        <div className="text-lg font-bold text-green-600">
                          {analysisState.overallResult.triangle4.faultType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Manual Input (100% Accurate)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Triangle 5 */}
                  {analysisState.overallResult.triangle5 && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                      <h4 className="font-bold text-lg mb-3 text-purple-800">Triangle 5</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">CH4, C2H4, C2H6</div>
                        <div className="text-lg font-bold text-purple-600">
                          {analysisState.overallResult.triangle5.faultType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Manual Input (100% Accurate)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <Button variant="primary" onClick={resetAnalysis}>
                    Analisis Baru
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setAnalysisState(prev => ({ ...prev, showExportModal: true }))}
                    disabled={analysisState.triangles.filter(t => t.isCompleted).length === 0}
                  >
                    <GetApp className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleSaveResults}
                    disabled={analysisState.triangles.filter(t => t.isCompleted).length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Hasil
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => setAnalysisState(prev => ({ ...prev, showHistoryModal: true }))}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Riwayat
                  </Button>

                  <div className={`text-sm flex items-center ${
                    isDark ? 'text-dark-muted' : 'text-gray-500'
                  }`}>
                    <CheckCircle className={`w-4 h-4 mr-1 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                    {analysisState.triangles.filter(t => t.isCompleted).length} / {analysisState.triangles.length} selesai
                  </div>
                </div>
              </div>

              {/* Detailed Recommendations */}
              {analysisState.overallResult.recommendations.length > 0 && (
                <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
                  isDark 
                    ? 'bg-dark-card border border-dark-border' 
                    : 'bg-white border border-gray-100'
                }`}>
                  <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                    isDark ? 'text-dark-text' : 'text-gray-900'
                  }`}>
                    <Assessment className={`w-8 h-8 mr-3 ${
                      isDark ? 'text-blue-400' : 'text-primary-accent'
                    }`} />
                    Rekomendasi Detail Pemeliharaan
                  </h3>
                  
                  {/* <div className="space-y-6">
                    {analysisState.overallResult.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-xl p-6 border transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700/30' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                        }`}
                      >
                        <h4 className={`text-xl font-bold mb-4 flex items-center ${
                          isDark ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          <CheckCircle className="w-6 h-6 mr-2" />
                          {rec.description}
                        </h4>
                        <div className="space-y-3">
                          {rec.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                                isDark ? 'bg-blue-400' : 'bg-blue-500'
                              }`}></div>
                              <p className={`leading-relaxed ${
                                isDark ? 'text-dark-text' : 'text-gray-700'
                              }`}>{action}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div> */}
                  
                  <div className="space-y-6">
  {analysisState.overallResult.recommendations.map((rec, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-xl p-6 border transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700/30'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}
    >
      {/* Judul Fault */}
      <h4
        className={`text-xl font-bold mb-6 flex items-center ${
          isDark ? 'text-blue-300' : 'text-blue-800'
        }`}
      >
        <CheckCircle className="w-6 h-6 mr-2" />
        {rec.description}
      </h4>

      {/* Dua kolom: Rekomendasi dan Preventif */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Rekomendasi */}
        <div
          className={`rounded-xl p-5 border ${
            isDark
              ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/30'
              : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
          }`}
        >
          <h5
            className={`font-bold text-lg mb-3 ${
              isDark ? 'text-yellow-300' : 'text-yellow-800'
            }`}
          >
             Rekomendasi Pemeliharaan
          </h5>
          {rec.rekomendasi?.length ? (
            <ul className="space-y-2 list-disc list-inside">
              {rec.rekomendasi.map((item, idx) => (
                <li
                  key={idx}
                  className={`${isDark ? 'text-dark-text' : 'text-gray-700'} leading-relaxed`}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              Tidak ada rekomendasi spesifik.
            </p>
          )}
        </div>

        {/* Preventif */}
        <div
          className={`rounded-xl p-5 border ${
            isDark
              ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}
        >
          <h5
            className={`font-bold text-lg mb-3 ${
              isDark ? 'text-green-300' : 'text-green-800'
            }`}
          >
             Pemeliharaan Preventif
          </h5>
          {rec.preventif?.length ? (
            <ul className="space-y-2 list-disc list-inside">
              {rec.preventif.map((item, idx) => (
                <li
                  key={idx}
                  className={`${isDark ? 'text-dark-text' : 'text-gray-700'} leading-relaxed`}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              Tidak ada tindakan preventif spesifik.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  ))}
</div>


                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Modal */}
        <AnimatePresence>
          {analysisState.showExportModal && (
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
                className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-4">Export PDF Configuration</h3>
                
                <div className="space-y-4">
                  {/* Triangle Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Triangle untuk Export:
                    </label>
                    <div className="space-y-2">
                      {[1, 4, 5].map(method => {
                        const hasCompleted = analysisState.triangles.some(t => 
                          t.triangleMethod === method && t.isCompleted
                        );
                        return (
                          <label key={method} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={analysisState.exportConfig.triangleSelection.includes(method as any)}
                              onChange={(e) => {
                                const triangleSelection = e.target.checked
                                  ? [...analysisState.exportConfig.triangleSelection, method as any]
                                  : analysisState.exportConfig.triangleSelection.filter(t => t !== method);
                                setAnalysisState(prev => ({
                                  ...prev,
                                  exportConfig: { ...prev.exportConfig, triangleSelection }
                                }));
                              }}
                              disabled={!hasCompleted}
                              className="mr-2"
                            />
                            <span className={hasCompleted ? 'text-gray-900' : 'text-gray-400'}>
                              Triangle {method} {hasCompleted ? '' : '(belum selesai)'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konten yang akan di-export:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={analysisState.exportConfig.includeImages}
                          onChange={(e) => setAnalysisState(prev => ({
                            ...prev,
                            exportConfig: { ...prev.exportConfig, includeImages: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span>Gambar/Screenshot</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={analysisState.exportConfig.includeGasData}
                          onChange={(e) => setAnalysisState(prev => ({
                            ...prev,
                            exportConfig: { ...prev.exportConfig, includeGasData: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span>Data Gas Concentrations</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={analysisState.exportConfig.includeRecommendations}
                          onChange={(e) => setAnalysisState(prev => ({
                            ...prev,
                            exportConfig: { ...prev.exportConfig, includeRecommendations: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span>Rekomendasi Pemeliharaan</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="primary" onClick={handleExportPDF}>
                    <Print className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAnalysisState(prev => ({ ...prev, showExportModal: false }))}
                  >
                    Batal
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Modal */}
        <AnimatePresence>
          {analysisState.showFilterModal && (
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
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-4">Filter Analisis</h3>
                
                <div className="space-y-4">
                  {/* Triangle Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Triangle Method:
                    </label>
                    <select
                      value={analysisState.filterConfig.triangleMethod || ''}
                      onChange={(e) => setAnalysisState(prev => ({
                        ...prev,
                        filterConfig: { 
                          ...prev.filterConfig, 
                          triangleMethod: e.target.value ? parseInt(e.target.value) as any : undefined
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Semua Triangle</option>
                      <option value="1">Triangle 1</option>
                      <option value="4">Triangle 4</option>
                      <option value="5">Triangle 5</option>
                    </select>
                  </div>

                  {/* Data Classification Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Classification:
                    </label>
                    <select
                      value={analysisState.filterConfig.dataClassification || ''}
                      onChange={(e) => setAnalysisState(prev => ({
                        ...prev,
                        filterConfig: { 
                          ...prev.filterConfig, 
                          dataClassification: e.target.value as any || undefined
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Semua Data</option>
                      {DATA_CLASSIFICATIONS.map(classification => (
                        <option key={classification} value={classification}>
                          {classification}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="primary" 
                    onClick={() => setAnalysisState(prev => ({ ...prev, showFilterModal: false }))}
                  >
                    Terapkan Filter
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAnalysisState(prev => ({ 
                      ...prev, 
                      showFilterModal: false,
                      filterConfig: {}
                    }))}
                  >
                    Reset Filter
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Modal */}
        <AnimatePresence>
          {analysisState.showHistoryModal && (
            <HistoryModal
              isOpen={analysisState.showHistoryModal}
              onClose={() => setAnalysisState(prev => ({ ...prev, showHistoryModal: false }))}
              onLoadHistory={handleLoadHistory}
            />
          )}
        </AnimatePresence>

        {/* Report Header Modal */}
        <AnimatePresence>
          {analysisState.showReportHeaderModal && (
            <ReportHeaderModal
              isOpen={analysisState.showReportHeaderModal}
              onClose={() => setAnalysisState(prev => ({ 
                ...prev, 
                showReportHeaderModal: false,
                pendingExport: false 
              }))}
              onSubmit={handleReportHeaderSubmit}
              initialData={analysisState.reportHeader || undefined}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DuvalAnalysis; 