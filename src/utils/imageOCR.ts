import Tesseract from 'tesseract.js';
import type { GasConcentration, DuvalTriangleMethod } from '../types';

export interface OCRResult {
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedGasData {
  triangleMethod: DuvalTriangleMethod;
  gasConcentrations: Partial<GasConcentration>;
  confidence: number;
  rawOCRResults: OCRResult[];
}

// Preprocess image untuk meningkatkan akurasi OCR
export const preprocessImageForOCR = async (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Enhance contrast and reduce noise
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Enhance contrast
        const enhanced = gray > 128 ? Math.min(255, gray * 1.3) : Math.max(0, gray * 0.7);
        
        data[i] = enhanced;     // Red
        data[i + 1] = enhanced; // Green
        data[i + 2] = enhanced; // Blue
        // Alpha stays the same
      }
      
      // Put processed image back
      ctx.putImageData(imageData, 0, 0);
      
      // Return as data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
};

// Extract text dari gambar menggunakan Tesseract
export const extractTextFromImage = async (imageFile: File): Promise<OCRResult[]> => {
  try {
    // Preprocess image
    const processedImageDataURL = await preprocessImageForOCR(imageFile);
    
    // Configure Tesseract for number and chemical formula recognition
    const result = await Tesseract.recognize(processedImageDataURL, 'eng', {
      logger: (m: any) => console.log('OCR Progress:', m),
    });
    
    // Extract word-level results with bounding boxes
    const words = (result.data as any).words || [];
    const ocrResults: OCRResult[] = words
      .filter((word: any) => word.confidence > 30) // Filter low confidence results
      .map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        }
      }));
    
    return ocrResults;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Parse gas concentration values dari OCR results
export const parseGasConcentrations = (ocrResults: OCRResult[]): Partial<GasConcentration> => {
  const gasValues: Partial<GasConcentration> = {};
  
  // Regex patterns untuk mendeteksi gas dan nilai
  const patterns = {
    ch4: /CH4.*?(\d+\.?\d*)/i,
    c2h4: /C2H4.*?(\d+\.?\d*)/i,
    c2h2: /C2H2.*?(\d+\.?\d*)/i,
    h2: /H2.*?(\d+\.?\d*)/i,
    c2h6: /C2H6.*?(\d+\.?\d*)/i,
    co: /CO.*?(\d+\.?\d*)/i,
    co2: /CO2.*?(\d+\.?\d*)/i,
  };
  
  // Combine all OCR text
  const fullText = ocrResults.map(r => r.text).join(' ');
  
  // Extract values for each gas
  Object.entries(patterns).forEach(([gasType, pattern]) => {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        switch (gasType) {
          case 'ch4':
            gasValues.ch4 = value;
            break;
          case 'c2h4':
            gasValues.c2h4 = value;
            break;
          case 'c2h2':
            gasValues.c2h2 = value;
            break;
          case 'h2':
            gasValues.h2 = value;
            break;
          case 'c2h6':
            gasValues.c2h6 = value;
            break;
          case 'co':
            gasValues.co = value;
            break;
          case 'co2':
            gasValues.co2 = value;
            break;
        }
      }
    }
  });
  
  return gasValues;
};

// Detect triangle method dari OCR results
export const detectTriangleMethod = (ocrResults: OCRResult[]): DuvalTriangleMethod | null => {
  const fullText = ocrResults.map(r => r.text).join(' ').toLowerCase();
  
  // Cek kombinasi gas untuk menentukan triangle method
  const hasH2 = /h2/.test(fullText);
  const hasCH4 = /ch4/.test(fullText);
  const hasC2H4 = /c2h4/.test(fullText);
  const hasC2H2 = /c2h2/.test(fullText);
  const hasC2H6 = /c2h6/.test(fullText);
  
  // Triangle 1: CH4, C2H4, C2H2
  if (hasCH4 && hasC2H4 && hasC2H2 && !hasH2 && !hasC2H6) {
    return 1;
  }
  
  // Triangle 4: H2, CH4, C2H6
  if (hasH2 && hasCH4 && hasC2H6) {
    return 4;
  }
  
  // Triangle 5: CH4, C2H4, C2H6
  if (hasCH4 && hasC2H4 && hasC2H6 && !hasH2 && !hasC2H2) {
    return 5;
  }
  
  // Default ke Triangle 1 jika tidak dapat mendeteksi
  return 1;
};

// Main function untuk extract gas data dari image
export const extractGasDataFromImage = async (imageFile: File): Promise<ExtractedGasData> => {
  try {
    // Extract text menggunakan OCR
    const ocrResults = await extractTextFromImage(imageFile);
    
    // Parse gas concentrations
    const gasConcentrations = parseGasConcentrations(ocrResults);
    
    // Detect triangle method
    const triangleMethod = detectTriangleMethod(ocrResults) || 1;
    
    // Calculate overall confidence
    const avgConfidence = ocrResults.length > 0 
      ? ocrResults.reduce((sum, result) => sum + result.confidence, 0) / ocrResults.length
      : 0;
    
    return {
      triangleMethod,
      gasConcentrations,
      confidence: avgConfidence,
      rawOCRResults: ocrResults
    };
  } catch (error) {
    console.error('Gas data extraction error:', error);
    throw error;
  }
}; 