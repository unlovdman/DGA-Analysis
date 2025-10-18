// User & Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'engineer' | 'viewer';
  organization?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// DGA Analysis Types
export type DuvalTriangleMethod = 1 | 4 | 5;

export interface GasConcentration {
  h2: number;   // Hydrogen
  ch4: number;  // Methane
  c2h6: number; // Ethane
  c2h4: number; // Ethylene 
  c2h2: number; // Acetylene
  co: number;   // Carbon Monoxide
  co2: number;  // Carbon Dioxide
  o2: number;   // Oxygen
  n2: number;   // Nitrogen
  o2_n2_ratio: number;   // O2/N2 ratio
  co2_co_ratio: number;  // CO2/CO ratio
  gas_by_volume: number; // % Gas by Volume
  nel_oil: number;       // NEL Oil
  nel_paper: number;     // NEL Paper
}

export interface DuvalReading {
  id: string;
  imageId: string;
  triangleMethod: 1 | 4 | 5;
  gasConcentrations: GasConcentration;
  confidenceScore: number;
  extractedAt: Date;
}

export interface TrianglePosition {
  x: number;
  y: number;
  method: 1 | 4 | 5;
}

// Fault Types berdasarkan Duval Triangle
export type Triangle1Fault = 'PD' | 'D2' | 'T1' | 'T3' | 'D1' | 'DT' | 'T2' | 'NORMAL';
export type Triangle4Fault = 'S' | 'D2' | 'PD' | 'ND' | 'DT' | 'C' | 'NORMAL';
export type Triangle5Fault = 'O' | 'S' | 'ND' | 'C' | 'T2' | 'T3' | 'NORMAL';

export type FaultType = Triangle1Fault | Triangle4Fault | Triangle5Fault;

export interface FaultZone {
  fault: FaultType;
  description: string;
  color: string;
  path: string; // SVG path untuk triangle zone
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  id: string;
  imageId: string;
  triangle1Fault?: Triangle1Fault;
  triangle4Fault?: Triangle4Fault;
  triangle5Fault?: Triangle5Fault;
  primaryFault: FaultType;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  confidenceOverall: number;
  position?: TrianglePosition;
  analyzedAt: Date;
}

// Image Upload Types
export interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  transformerId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  analysisResults?: AnalysisResult[];
}

// Transformer Types
export interface Transformer {
  id: string;
  name: string;
  serialNumber: string;
  manufacturer?: string;
  installationDate?: Date;
  voltageRating?: string;
  powerRating?: string;
  location?: string;
  createdBy: string;
}

// Recommendation Types
export interface Recommendation {
  id: string;
  analysisId: string;
  faultType: FaultType;
  recommendationText: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  maintenanceInterval?: string;
  actions: string[];
  createdAt: Date;
}

// Maintenance Log Types
export interface MaintenanceLog {
  id: string;
  transformerId: string;
  recommendationId?: string;
  actionTaken: string;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalAnalyses: number;
  faultsDetected: number;
  criticalFaults: number;
  transformersMonitored: number;
  recentAnalyses: AnalysisResult[];
  faultTrends: FaultTrendData[];
}

export interface FaultTrendData {
  date: string;
  faultCount: number;
  faultType: FaultType;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Animation Types
export interface AnimationVariants {
  initial: object;
  animate: object;
  exit?: object;
  transition?: object;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

// Form Types
export interface ImageUploadForm {
  files: FileList | null;
  transformerId?: string;
  description?: string;
}

export interface TransformerForm {
  name: string;
  serialNumber: string;
  manufacturer?: string;
  installationDate?: Date;
  voltageRating?: string;
  powerRating?: string;
  location?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// App Configuration Types
export interface AppConfig {
  appName: string;
  version: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  duvalTriangleMethods: (1 | 4 | 5)[];
}

// Export all fault recommendations constant type
export interface FaultRecommendationConfig {
  description: string;
  rekomendasi: string[];
  preventif: string[];
  note?: string;
}

 

// Data classification types
export type DataClassification = 'Data 1' | 'Data 2' | 'Data 3' | 'Data 4' | 'Data 5' | 'Data 6' | 'Data 7' | 'Data 8';

// CO-based severity for Data 1
export type COSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface COAnalysisResult {
  coLevel: number;
  severity: COSeverity;
  description: string;
  resamplingInterval: string;
  recommendations: string[];
}

// Export configuration
export interface ExportConfig {
  includeImages: boolean;
  includeGasData: boolean;
  includeRecommendations: boolean;
  triangleSelection: DuvalTriangleMethod[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Filter and sort configuration
export interface FilterConfig {
  triangleMethod?: DuvalTriangleMethod;
  dataClassification?: DataClassification;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortConfig {
  field: 'date' | 'triangle' | 'severity' | 'dataClassification';
  direction: 'asc' | 'desc';
} 

// Report Header Types
export interface ReportHeader {
  samplingDate: string;
  idTrafo: string;
  serialNo: string;
  powerRating: string;
  voltageRatio: string;
  category: string;
  manufacture: string;
  oilBrand: string;
  weightVolumeOil: string;
  year: string;
  temperature: string;
  samplingPoint: string;
}

// History Types  
export interface AnalysisHistory {
  id: string;
  triangles: ManualTriangleData[];
  overallResult: any; // Use any for now to avoid circular import issues
  reportHeader?: ReportHeader;
  createdAt: Date;
  exportedAt?: Date;
}

// Breakdown Voltage Analysis Types
export type TransformerType = 'O' | 'A' | 'B' | 'C';

export interface TransformerVoltageRange {
  type: TransformerType;
  label: string;
  voltageRange: string;
  good: string;
  fair: string;
  poor: string;
  goodThreshold: number;
  fairThreshold: number;
}

export interface BreakdownVoltageData {
  id: string;
  idTrafo: string;
  transformerType: TransformerType;
  dielectricStrengths: number[]; // Array of 6 measurements
  average: number;
  result: 'good' | 'fair' | 'poor';
  recommendation: string;
  createdAt: Date;
  lastModified: Date;
}

export interface BreakdownVoltageHistory {
  id: string;
  breakdownData: BreakdownVoltageData;
  createdAt: Date;
  exportedAt?: Date;
}

// Enhanced Triangle Data for multiple images
export interface TriangleImage {
  id: string;
  imageUrl: string;
  source: 'file' | 'clipboard';
  filename?: string;
  uploadedAt: Date;
}

export interface ManualTriangleData {
  id: string;
  triangleMethod: 1 | 4 | 5;
  dataClassification: DataClassification;
  images: TriangleImage[]; // Changed from single imageUrl to array
  gasConcentrations: Partial<GasConcentration>;
  selectedFault: string | null;
  coAnalysisResult: COAnalysisResult | null;
  isCompleted: boolean;
  createdAt: Date;
  lastModified: Date;
} 