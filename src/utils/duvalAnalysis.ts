import type { 
  GasConcentration, 
  DuvalTriangleMethod, 
  Triangle1Fault, 
  Triangle4Fault, 
  Triangle5Fault,
  FaultRecommendationConfig 
} from '../types';
import { FAULT_RECOMMENDATIONS } from '../data/faultRecommendations';

export interface TriangleCoordinate {
  x: number;
  y: number;
}

export interface FaultDetectionResult {
  triangleMethod: DuvalTriangleMethod;
  faultType: Triangle1Fault | Triangle4Fault | Triangle5Fault | 'NORMAL';
  confidence: number;
  coordinates: TriangleCoordinate;
  gasRatios: {
    gas1: number;
    gas2: number;
    gas3: number;
  };
}

export interface AnalysisResult {
  triangle1?: FaultDetectionResult;
  triangle4?: FaultDetectionResult;
  triangle5?: FaultDetectionResult;
  overallRecommendation: string;
  recommendations: FaultRecommendationConfig[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Fungsi untuk menghitung koordinat triangle dari gas concentrations
export const calculateTriangleCoordinates = (
  gas1: number, 
  gas2: number, 
  gas3: number
): TriangleCoordinate => {
  // Normalisasi ke persentase total 100%
  const total = gas1 + gas2 + gas3;
  if (total === 0) {
    return { x: 0, y: 0 };
  }
  
  const p1 = (gas1 / total) * 100;
  const p2 = (gas2 / total) * 100;
  const p3 = (gas3 / total) * 100;
  
  // Konversi ke koordinat triangle (gas3 = bottom, gas1 = top-left, gas2 = top-right)
  const x = p2 + 0.5 * p1;
  const y = (Math.sqrt(3) / 2) * p1;
  
  return { x, y };
};

// Deteksi fault berdasarkan Triangle 1 (CH4, C2H4, C2H2)
export const analyzeTriangle1 = (gasConcentration: Partial<GasConcentration>): FaultDetectionResult | null => {
  const { ch4 = 0, c2h4 = 0, c2h2 = 0 } = gasConcentration;
  
  if (ch4 === 0 && c2h4 === 0 && c2h2 === 0) {
    return null;
  }
  
  const coordinates = calculateTriangleCoordinates(ch4, c2h4, c2h2);
  const total = ch4 + c2h4 + c2h2;
  
  // Persentase untuk Triangle 1
  const pCH4 = (ch4 / total) * 100;
  const pC2H4 = (c2h4 / total) * 100;
  const pC2H2 = (c2h2 / total) * 100;
  
  let faultType: Triangle1Fault = 'PD';
  let confidence = 0.8;
  
  // Fault detection logic berdasarkan area triangle
  if (pC2H2 > 13) {
    if (pC2H4 > 23) {
      faultType = 'D2'; // High Energy Discharge
    } else if (pC2H4 > 9) {
      faultType = 'D1'; // Low Energy Discharge  
    } else {
      faultType = 'DT'; // Discharge with Thermal
    }
  } else if (pC2H4 > 23) {
    if (pCH4 > 75) {
      faultType = 'T1'; // Thermal < 300°C
    } else {
      faultType = 'T2'; // Thermal 300-700°C
    }
  } else if (pC2H4 > 9) {
    if (pCH4 > 85) {
      faultType = 'T1'; // Thermal < 300°C
    } else {
      faultType = 'T3'; // Thermal > 700°C
    }
  } else {
    faultType = 'PD'; // Partial Discharge
  }
  
  return {
    triangleMethod: 1,
    faultType,
    confidence,
    coordinates,
    gasRatios: {
      gas1: pCH4,
      gas2: pC2H4,
      gas3: pC2H2
    }
  };
};

// Deteksi fault berdasarkan Triangle 4 (H2, CH4, C2H6)
export const analyzeTriangle4 = (gasConcentration: Partial<GasConcentration>): FaultDetectionResult | null => {
  const { h2 = 0, ch4 = 0, c2h6 = 0 } = gasConcentration;
  
  if (h2 === 0 && ch4 === 0 && c2h6 === 0) {
    return null;
  }
  
  const coordinates = calculateTriangleCoordinates(h2, ch4, c2h6);
  const total = h2 + ch4 + c2h6;
  
  // Persentase untuk Triangle 4
  const pH2 = (h2 / total) * 100;
  const pCH4 = (ch4 / total) * 100;
  const pC2H6 = (c2h6 / total) * 100;
  
  let faultType: Triangle4Fault = 'ND';
  let confidence = 0.8;
  
  // Fault detection logic untuk Triangle 4
  if (pH2 > 50) {
    if (pCH4 > 15) {
      faultType = 'PD'; // Partial Discharge
    } else {
      faultType = 'ND'; // Normal Degradation
    }
  } else if (pC2H6 > 40) {
    if (pCH4 > 15) {
      faultType = 'C'; // Corona
    } else {
      faultType = 'S'; // Stray Gassing
    }
  } else if (pCH4 > 65) {
    faultType = 'DT'; // Discharge with Thermal
  } else {
    faultType = 'D2'; // High Energy Discharge
  }
  
  return {
    triangleMethod: 4,
    faultType,
    confidence,
    coordinates,
    gasRatios: {
      gas1: pH2,
      gas2: pCH4,
      gas3: pC2H6
    }
  };
};

// Deteksi fault berdasarkan Triangle 5 (CH4, C2H4, C2H6)
export const analyzeTriangle5 = (gasConcentration: Partial<GasConcentration>): FaultDetectionResult | null => {
  const { ch4 = 0, c2h4 = 0, c2h6 = 0 } = gasConcentration;
  
  if (ch4 === 0 && c2h4 === 0 && c2h6 === 0) {
    return null;
  }
  
  const coordinates = calculateTriangleCoordinates(ch4, c2h4, c2h6);
  const total = ch4 + c2h4 + c2h6;
  
  // Persentase untuk Triangle 5
  const pCH4 = (ch4 / total) * 100;
  const pC2H4 = (c2h4 / total) * 100;
  const pC2H6 = (c2h6 / total) * 100;
  
  let faultType: Triangle5Fault = 'ND';
  let confidence = 0.8;
  
  // Fault detection logic untuk Triangle 5
  if (pC2H4 > 50) {
    if (pCH4 > 20) {
      faultType = 'T2'; // Thermal 300-700°C
    } else {
      faultType = 'T3'; // Thermal > 700°C
    }
  } else if (pC2H6 > 60) {
    if (pCH4 > 40) {
      faultType = 'C'; // Corona
    } else {
      faultType = 'S'; // Stray Gassing
    }
  } else if (pCH4 > 80) {
    faultType = 'O'; // Overheating < 200°C
  } else {
    faultType = 'ND'; // Normal Degradation
  }
  
  return {
    triangleMethod: 5,
    faultType,
    confidence,
    coordinates,
    gasRatios: {
      gas1: pCH4,
      gas2: pC2H4,
      gas3: pC2H6
    }
  };
};

// Determine severity berdasarkan fault type
export const determineSeverity = (faults: FaultDetectionResult[]): 'low' | 'medium' | 'high' | 'critical' => {
  const criticalFaults = ['D2', 'T3'];
  const highFaults = ['D1', 'DT', 'T2'];
  const mediumFaults = ['T1', 'C'];
  
  for (const fault of faults) {
    if (criticalFaults.includes(fault.faultType as string)) {
      return 'critical';
    }
  }
  
  for (const fault of faults) {
    if (highFaults.includes(fault.faultType as string)) {
      return 'high';
    }
  }
  
  for (const fault of faults) {
    if (mediumFaults.includes(fault.faultType as string)) {
      return 'medium';
    }
  }
  
  return 'low';
};

// Generate overall recommendation
export const generateOverallRecommendation = (faults: FaultDetectionResult[]): string => {
  if (faults.length === 0) {
    return 'Tidak ada indikasi gangguan yang terdeteksi. Lanjutkan monitoring rutin DGA sesuai jadwal.';
  }
  
  const faultTypes = faults.map(f => f.faultType);
  const uniqueFaults = [...new Set(faultTypes)];
  
  if (uniqueFaults.includes('D2')) {
    return 'CRITICAL: Terdeteksi High Energy Discharge (D2). Segera lakukan shutdown dan inspeksi internal transformator.';
  }
  
  if (uniqueFaults.includes('T3')) {
    return 'CRITICAL: Terdeteksi Thermal Fault >700°C (T3). Segera lakukan shutdown dan perbaikan komprehensif.';
  }
  
  if (uniqueFaults.includes('D1')) {
    return 'HIGH: Terdeteksi Low Energy Discharge (D1). Lakukan inspeksi mendalam dan perbaikan isolasi.';
  }
  
  if (uniqueFaults.includes('T2')) {
    return 'HIGH: Terdeteksi Thermal Fault 300-700°C (T2). Periksa sistem pendingin dan beban operasi.';
  }
  
  if (uniqueFaults.includes('T1')) {
    return 'MEDIUM: Terdeteksi Thermal Fault <300°C (T1). Tingkatkan monitoring dan periksa hotspot.';
  }
  
  if (uniqueFaults.includes('PD')) {
    return 'MEDIUM: Terdeteksi Partial Discharge (PD). Lakukan pengukuran PD dan periksa isolasi.';
  }
  
  return 'Terdeteksi indikasi gangguan ringan. Tingkatkan frekuensi monitoring DGA.';
};

// Main analysis function
export const analyzeDuvalTriangles = (gasConcentration: Partial<GasConcentration>): AnalysisResult => {
  const results: FaultDetectionResult[] = [];
  
  // Analyze Triangle 1 (default)
  const triangle1Result = analyzeTriangle1(gasConcentration);
  if (triangle1Result) {
    results.push(triangle1Result);
  }
  
  // Analyze Triangle 4 jika ada H2 dan C2H6
  if (gasConcentration.h2 && gasConcentration.c2h6) {
    const triangle4Result = analyzeTriangle4(gasConcentration);
    if (triangle4Result) {
      results.push(triangle4Result);
    }
  }
  
  // Analyze Triangle 5 jika ada C2H6
  if (gasConcentration.c2h6) {
    const triangle5Result = analyzeTriangle5(gasConcentration);
    if (triangle5Result) {
      results.push(triangle5Result);
    }
  }
  
  const severity = determineSeverity(results);
  const overallRecommendation = generateOverallRecommendation(results);
  
  // Get recommendations from all detected faults
  const recommendations: FaultRecommendationConfig[] = [];
  const uniqueFaultTypes = [...new Set(results.map(r => r.faultType))];
  
  uniqueFaultTypes.forEach(faultType => {
    if (FAULT_RECOMMENDATIONS[faultType as keyof typeof FAULT_RECOMMENDATIONS]) {
      recommendations.push(FAULT_RECOMMENDATIONS[faultType as keyof typeof FAULT_RECOMMENDATIONS]);
    }
  });
  
  // If no faults detected, add normal condition recommendation
  if (results.length === 0) {
    recommendations.push(FAULT_RECOMMENDATIONS.NORMAL);
  }
  
  return {
    triangle1: results.find(r => r.triangleMethod === 1),
    triangle4: results.find(r => r.triangleMethod === 4),
    triangle5: results.find(r => r.triangleMethod === 5),
    overallRecommendation,
    recommendations,
    severity
  };
}; 