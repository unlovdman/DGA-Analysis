import type { FaultZone, Triangle1Fault, Triangle4Fault, Triangle5Fault } from '../types';
import { FAULT_COLORS, FAULT_SEVERITY } from './faultRecommendations';

// Triangle 1 Zones (CH4, C2H4, C2H2)
export const TRIANGLE_1_ZONES: FaultZone[] = [
  {
    fault: 'PD' as Triangle1Fault,
    description: 'Partial Discharge',
    color: FAULT_COLORS.PD,
    path: 'M 200,20 L 280,180 L 200,100 Z',
    severity: FAULT_SEVERITY.PD as 'low' | 'medium' | 'high'
  },
  {
    fault: 'T1' as Triangle1Fault,
    description: 'Thermal < 300°C',
    color: FAULT_COLORS.T1,
    path: 'M 20,340 L 120,180 L 80,300 Z',
    severity: FAULT_SEVERITY.T1 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'T2' as Triangle1Fault,
    description: 'Thermal 300-700°C',
    color: FAULT_COLORS.T2,
    path: 'M 80,300 L 120,180 L 200,280 Z',
    severity: FAULT_SEVERITY.T2 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'T3' as Triangle1Fault,
    description: 'Thermal > 700°C',
    color: FAULT_COLORS.T3,
    path: 'M 200,280 L 280,340 L 200,340 Z',
    severity: FAULT_SEVERITY.T3 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'D1' as Triangle1Fault,
    description: 'Low Energy Discharge',
    color: FAULT_COLORS.D1,
    path: 'M 200,100 L 280,180 L 240,200 Z',
    severity: FAULT_SEVERITY.D1 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'D2' as Triangle1Fault,
    description: 'High Energy Discharge',
    color: FAULT_COLORS.D2,
    path: 'M 240,200 L 380,340 L 280,340 Z',
    severity: FAULT_SEVERITY.D2 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'DT' as Triangle1Fault,
    description: 'Discharge + Thermal',
    color: FAULT_COLORS.DT,
    path: 'M 200,280 L 240,200 L 280,340 Z',
    severity: FAULT_SEVERITY.DT as 'low' | 'medium' | 'high'
  }
];

// Triangle 4 Zones (H2, CH4, C2H6)
export const TRIANGLE_4_ZONES: FaultZone[] = [
  {
    fault: 'S' as Triangle4Fault,
    description: 'Stray Gassing',
    color: FAULT_COLORS.S,
    path: 'M 200,20 L 300,120 L 200,100 Z',
    severity: FAULT_SEVERITY.S as 'low' | 'medium' | 'high'
  },
  {
    fault: 'C' as Triangle4Fault,
    description: 'Corona',
    color: FAULT_COLORS.C,
    path: 'M 20,340 L 100,200 L 80,320 Z',
    severity: FAULT_SEVERITY.C as 'low' | 'medium' | 'high'
  },
  {
    fault: 'PD' as Triangle4Fault,
    description: 'Partial Discharge',
    color: FAULT_COLORS.PD,
    path: 'M 200,100 L 300,120 L 250,180 Z',
    severity: FAULT_SEVERITY.PD as 'low' | 'medium' | 'high'
  },
  {
    fault: 'D2' as Triangle4Fault,
    description: 'High Energy Discharge',
    color: FAULT_COLORS.D2,
    path: 'M 250,180 L 380,340 L 300,340 Z',
    severity: FAULT_SEVERITY.D2 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'DT' as Triangle4Fault,
    description: 'Discharge + Thermal',
    color: FAULT_COLORS.DT,
    path: 'M 150,250 L 250,180 L 200,300 Z',
    severity: FAULT_SEVERITY.DT as 'low' | 'medium' | 'high'
  },
  {
    fault: 'ND' as Triangle4Fault,
    description: 'No Decision',
    color: FAULT_COLORS.ND,
    path: 'M 100,200 L 150,250 L 80,320 Z',
    severity: FAULT_SEVERITY.ND as 'low' | 'medium' | 'high'
  }
];

// Triangle 5 Zones (CH4, C2H4, C2H6)
export const TRIANGLE_5_ZONES: FaultZone[] = [
  {
    fault: 'S' as Triangle5Fault,
    description: 'Stray Gassing',
    color: FAULT_COLORS.S,
    path: 'M 200,20 L 280,140 L 200,120 Z',
    severity: FAULT_SEVERITY.S as 'low' | 'medium' | 'high'
  },
  {
    fault: 'C' as Triangle5Fault,
    description: 'Corona',
    color: FAULT_COLORS.C,
    path: 'M 20,340 L 120,220 L 60,320 Z',
    severity: FAULT_SEVERITY.C as 'low' | 'medium' | 'high'
  },
  {
    fault: 'O' as Triangle5Fault,
    description: 'Overheating',
    color: FAULT_COLORS.O,
    path: 'M 200,120 L 280,140 L 220,200 Z',
    severity: FAULT_SEVERITY.O as 'low' | 'medium' | 'high'
  },
  {
    fault: 'T2' as Triangle5Fault,
    description: 'Thermal 300-700°C',
    color: FAULT_COLORS.T2,
    path: 'M 120,220 L 220,200 L 160,280 Z',
    severity: FAULT_SEVERITY.T2 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'T3' as Triangle5Fault,
    description: 'Thermal > 700°C',
    color: FAULT_COLORS.T3,
    path: 'M 220,200 L 380,340 L 280,340 Z',
    severity: FAULT_SEVERITY.T3 as 'low' | 'medium' | 'high'
  },
  {
    fault: 'ND' as Triangle5Fault,
    description: 'No Decision',
    color: FAULT_COLORS.ND,
    path: 'M 60,320 L 120,220 L 160,280 Z',
    severity: FAULT_SEVERITY.ND as 'low' | 'medium' | 'high'
  }
];

// Mapping untuk memudahkan akses berdasarkan method
export const DUVAL_TRIANGLE_ZONES = {
  1: TRIANGLE_1_ZONES,
  4: TRIANGLE_4_ZONES,
  5: TRIANGLE_5_ZONES
} as const;

// Triangle method descriptions
export const TRIANGLE_DESCRIPTIONS = {
  1: {
    name: 'Triangle 1',
    gases: ['CH4', 'C2H4', 'C2H2'],
    description: 'Primary triangle for fault detection using methane, ethylene, and acetylene'
  },
  4: {
    name: 'Triangle 4',
    gases: ['H2', 'CH4', 'C2H6'],
    description: 'Secondary triangle using hydrogen, methane, and ethane for enhanced analysis'
  },
  5: {
    name: 'Triangle 5',
    gases: ['CH4', 'C2H4', 'C2H6'],
    description: 'Tertiary triangle using methane, ethylene, and ethane for comprehensive analysis'
  }
} as const;

// Helper function to calculate triangle position
export const calculateTrianglePosition = (
  gas1: number,
  gas2: number,
  gas3: number,
  method: 1 | 4 | 5
): { x: number; y: number; method: 1 | 4 | 5 } => {
  // Normalize percentages to sum to 100
  const total = gas1 + gas2 + gas3;
  if (total === 0) {
    return { x: 200, y: 200, method }; // Center point if no data
  }
  
  const normalized = {
    gas1: (gas1 / total) * 100,
    gas2: (gas2 / total) * 100,
    gas3: (gas3 / total) * 100
  };
  
  // Convert to triangle coordinates (simplified)
  // For a proper implementation, this would need the actual triangle coordinate system
  const x = normalized.gas3 + 0.5 * normalized.gas1;
  const y = (Math.sqrt(3) / 2) * normalized.gas1;
  
  // Scale to SVG coordinates (400x400 viewBox)
  const scaledX = (x / 100) * 360 + 20;
  const scaledY = (y / 100) * 320 + 20;
  
  return { x: scaledX, y: scaledY, method };
};

// Helper function to determine fault zone based on position
export const determineFaultZone = (
  position: { x: number; y: number },
  method: 1 | 4 | 5
): Triangle1Fault | Triangle4Fault | Triangle5Fault => {
  const zones = DUVAL_TRIANGLE_ZONES[method];
  
  // Simple point-in-polygon check (simplified for demo)
  // In a real implementation, this would use proper geometric calculations
  for (const zone of zones) {
    // This is a simplified check - in reality you'd need proper SVG path collision detection
    if (isPointInZone(position, zone)) {
      return zone.fault;
    }
  }
  
  return 'NORMAL' as any; // Default fallback
};

// Simplified point-in-zone check (placeholder implementation)
const isPointInZone = (point: { x: number; y: number }, zone: FaultZone): boolean => {
  // This is a placeholder implementation
  // In a real application, you would implement proper SVG path collision detection
  // or use a library like d3.js for geometric calculations
  return false;
}; 