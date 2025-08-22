import type { TransformerVoltageRange } from '../types';

export const TRANSFORMER_VOLTAGE_RANGES: TransformerVoltageRange[] = [
  {
    type: 'O',
    label: 'Type O (> 400KV)',
    voltageRange: '> 400KV',
    good: '> 60 kV',
    fair: '50-60 kV',
    poor: '< 50 kV',
    goodThreshold: 60,
    fairThreshold: 50
  },
  {
    type: 'A',
    label: 'Type A (170KV - 400KV)',
    voltageRange: '170KV - 400KV',
    good: '> 60 kV',
    fair: '50-60 kV',
    poor: '< 50 kV',
    goodThreshold: 60,
    fairThreshold: 50
  },
  {
    type: 'B',
    label: 'Type B (72,5KV)',
    voltageRange: '72,5KV',
    good: '> 50 kV',
    fair: '40-50 kV',
    poor: '< 40 kV',
    goodThreshold: 50,
    fairThreshold: 40
  },
  {
    type: 'C',
    label: 'Type C (< 72,5KV)',
    voltageRange: '< 72,5KV',
    good: '> 40 kV',
    fair: '30-40 kV',
    poor: '< 30 kV',
    goodThreshold: 40,
    fairThreshold: 30
  }
];

export const BREAKDOWN_VOLTAGE_RECOMMENDATIONS = {
  good: 'BAIK: Dilakukan Resampling Secara Berkala 6-12 Bulan untuk monitoring isolasi tegangan tembus dan lakukan purifikasi atau filtering oil guna meningkatkan kualitas isolasi tegangan tembus.',
  fair: 'CUKUP: Dilakukan resampling secara berkala 3-6 bulan untuk monitoring isolasi tegangan tembus dan lakukan purifikasi atau filtering oil guna meningkatkan kualitas isolasi tegangan tembus.',
  poor: 'BURUK: Filtering oil guna meningkatkan kualitas isolasi tegangan tembus dan lakukan pengambilan sampel DGA untuk mengetahui gas aktif yang terlarut pada trafo.'
};

export const analyzeBreakdownVoltage = (average: number, transformerType: string) => {
  const range = TRANSFORMER_VOLTAGE_RANGES.find(r => r.type === transformerType);
  if (!range) return { result: 'poor', recommendation: BREAKDOWN_VOLTAGE_RECOMMENDATIONS.poor };

  if (average > range.goodThreshold) {
    return { result: 'good' as const, recommendation: BREAKDOWN_VOLTAGE_RECOMMENDATIONS.good };
  } else if (average >= range.fairThreshold) {
    return { result: 'fair' as const, recommendation: BREAKDOWN_VOLTAGE_RECOMMENDATIONS.fair };
  } else {
    return { result: 'poor' as const, recommendation: BREAKDOWN_VOLTAGE_RECOMMENDATIONS.poor };
  }
}; 