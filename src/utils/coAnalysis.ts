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
      'Resampling secara berkala untuk monitoring perkembangan gas yang terlarut dalam minyak trafo',
      'CO (Karbon Monoxide) LOW (<500) resampling berkala dalam rentang waktu 4-8 bulan',
      'Lakukan monitoring rutin kondisi transformator',
      'Pastikan sistem pendingin berfungsi normal',
      'Dokumentasikan hasil DGA untuk trend analysis'
    ];
  } else if (coLevel >= 500 && coLevel <= 600) {
    severity = 'MEDIUM';
    description = 'CO (Karbon Monoxide) MEDIUM';
    resamplingInterval = '2-4 bulan';
    recommendations = [
      'Resampling secara berkala untuk monitoring perkembangan gas yang terlarut dalam minyak trafo',
      'CO (Karbon Monoxide) MEDIUM (500-600) resampling berkala dalam rentang waktu 2-4 bulan',
      'Tingkatkan frekuensi monitoring DGA',
      'Periksa sistem pendingin dan sirkulasi minyak',
      'Evaluasi beban operasi transformator',
      'Lakukan pengujian kualitas minyak isolasi'
    ];
  } else {
    severity = 'HIGH';
    description = 'CO (Karbon Monoxide) HIGH';
    resamplingInterval = '2-4 bulan';
    recommendations = [
      'Resampling secara berkala untuk monitoring perkembangan gas yang terlarut dalam minyak trafo',
      'CO (Karbon Monoxide) HIGH (>600) resampling berkala dalam rentang waktu 2-4 bulan',
      'Segera lakukan inspeksi mendetail pada transformator',
      'Periksa sistem pendingin dan optimasi pendinginan',
      'Evaluasi dan kurangi beban operasi jika memungkinkan',
      'Lakukan pengujian komprehensif kualitas minyak',
      'Pertimbangkan filtering atau penggantian minyak',
      'Tingkatkan monitoring ke setiap 1-2 bulan'
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