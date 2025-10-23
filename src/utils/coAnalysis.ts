import type { COAnalysisResult, COSeverity } from '../types';

export const analyzeCOLevel = (coLevel: number): COAnalysisResult => {
  let severity: COSeverity;
  let description: string;
  let resamplingInterval: string;
  let recommendations: string[];

  if (coLevel < 500) {
    severity = 'LOW';
    description = 'CO (Karbon Monoxide) LOW';
    resamplingInterval = '4-8 bulan';
    recommendations = [
      'Continue Operation',
      'CO dalam limit Low dilakukan resampling berkala dalam rentang waktu 4-8 bulan'
    ];
  } else if (coLevel >= 500 && coLevel <= 600) {
    severity = 'MEDIUM';
    description = 'CO (Karbon Monoxide) MEDIUM';
    resamplingInterval = '2-4 bulan';
    recommendations = [
      'Continue Operation',
      'CO dalam limit Medium dilakukan resampling berkala dalam rentang waktu 2-4 bulan'
    ];
  } else {
    severity = 'HIGH';
    description = 'CO (Karbon Monoxide) HIGH';
    resamplingInterval = '1-2 bulan';
    recommendations = [
      'Continue Operation',
      'CO dalam limit High dilakukan resampling berkala dalam rentang waktu 1-2 bulan'
    ];
  }

  return {
    coLevel,
    severity,
    description,
    resamplingInterval,
    recommendations
  };
}; 