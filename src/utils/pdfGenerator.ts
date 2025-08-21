import { jsPDF } from 'jspdf';
import type { ReportHeader, ManualTriangleData, FaultRecommendationConfig } from '../types';
import type { AnalysisResult } from './duvalAnalysis';

interface PDFGenerationData {
  reportHeader: ReportHeader;
  triangles: ManualTriangleData[];
  overallResult: AnalysisResult | null;
  includeImages: boolean;
  includeGasData: boolean;
  includeRecommendations: boolean;
}

// Helper function to convert image URL to base64 with proper sizing
const getImageBase64 = (imageUrl: string): Promise<{ dataUrl: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate optimal size for PDF (max width 100px, max height 80px)
      const maxWidth = 100;
      const maxHeight = 80;
      let { width, height } = img;
      
      // Maintain aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        width,
        height
      });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const generateDGAPDF = async (data: PDFGenerationData): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // Helper function to check page break
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title Section with border
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DGA ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
  
  // Add underline
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
  yPosition += 15;

  // Sample Data Section with table-like format
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Sample Data', margin, yPosition);
  yPosition += 10;

  // Create bordered table for header data
  const headerData = [
    ['Sampling Date', data.reportHeader.samplingDate, 'Manufacture', data.reportHeader.manufacture],
    ['ID Trafo', data.reportHeader.idTrafo, 'Oil Brand', data.reportHeader.oilBrand],
    ['Serial No.', data.reportHeader.serialNo, 'Weight / Volume Oil', data.reportHeader.weightVolumeOil],
    ['Power Rating', data.reportHeader.powerRating, 'Year', data.reportHeader.year],
    ['Voltage Ratio', data.reportHeader.voltageRatio, 'Temperature', data.reportHeader.temperature],
    ['Category', data.reportHeader.category, 'Sampling Point', data.reportHeader.samplingPoint]
  ];

  // Draw table borders
  const tableStartY = yPosition;
  const rowHeight = 6;
  const colWidths = [38, 48, 38, 48];
  
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  headerData.forEach((row, rowIndex) => {
    const currentY = tableStartY + (rowIndex * rowHeight);
    
    // Draw row border
    doc.rect(margin, currentY - 1, contentWidth, rowHeight);
    
    // Add data
    let xPos = margin + 2;
    row.forEach((cell, cellIndex) => {
      if (cellIndex % 2 === 0) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.text(cell, xPos, currentY + 3);
      xPos += colWidths[cellIndex];
    });
  });

  yPosition = tableStartY + (headerData.length * rowHeight) + 10;

  // Analysis Results Section
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Results', margin, yPosition);
  yPosition += 10;

  for (const triangle of data.triangles) {
    checkPageBreak(60);

    // Triangle header with background
    doc.setFillColor(240, 248, 255); // Light blue background
    doc.rect(margin, yPosition - 3, contentWidth, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Triangle ${triangle.triangleMethod} - ${triangle.dataClassification}`, margin + 3, yPosition + 2);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Analysis Result
    if (triangle.dataClassification === 'Data 1' && triangle.coAnalysisResult) {
      doc.setFont('helvetica', 'bold');
      doc.text('CO Analysis Result:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      doc.text(`• Severity: ${triangle.coAnalysisResult.severity}`, margin + 8, yPosition);
      yPosition += 4;
      doc.text(`• CO Level: ${triangle.coAnalysisResult.coLevel} ppm`, margin + 8, yPosition);
      yPosition += 4;
      doc.text(`• Resampling Interval: ${triangle.coAnalysisResult.resamplingInterval}`, margin + 8, yPosition);
      yPosition += 6;
    } else if (triangle.selectedFault) {
      doc.setFont('helvetica', 'bold');
      doc.text('Fault Analysis Result:', margin + 5, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      doc.text(`• Fault Type: ${triangle.selectedFault}`, margin + 8, yPosition);
      yPosition += 6;
    }

    // Gas Data in organized format
    if (data.includeGasData && Object.keys(triangle.gasConcentrations).length > 0) {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.text('Gas Concentrations:', margin + 5, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Create gas data in columns
      const gasEntries = Object.entries(triangle.gasConcentrations).filter(([_, value]) => value && value > 0);
      const cols = 3;
      const colWidth = contentWidth / cols;
      
      gasEntries.forEach(([gas, value], index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const xPos = margin + 10 + (col * colWidth);
        const yPos = yPosition + (row * 5);
        
        doc.text(`${gas.toUpperCase()}: ${value} ppm`, xPos, yPos);
      });
      
      yPosition += Math.ceil(gasEntries.length / cols) * 5 + 5;
      doc.setFontSize(10);
    }

    // Images with actual embedding
    if (data.includeImages && triangle.images.length > 0) {
      checkPageBreak(60);
      doc.setFont('helvetica', 'bold');
      doc.text(`Attached Images (${triangle.images.length}):`, margin + 5, yPosition);
      yPosition += 8;
      
      for (let i = 0; i < triangle.images.length; i++) {
        const image = triangle.images[i];
        
        try {
          checkPageBreak(50);
          
          // Try to embed the actual image
          const { dataUrl, width, height } = await getImageBase64(image.imageUrl);
          
          doc.addImage(dataUrl, 'JPEG', margin + 10, yPosition, width, height);
          
          // Add image caption
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(`Image ${i + 1} (${image.source})`, margin + 10, yPosition + height + 5);
          doc.text(`Uploaded: ${image.uploadedAt.toLocaleDateString('id-ID')}`, margin + 10, yPosition + height + 10);
          
          yPosition += height + 15;
          
        } catch (error) {
          // Fallback if image cannot be embedded
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`• Image ${i + 1} (${image.source}) - ${image.filename}`, margin + 10, yPosition);
          doc.text(`  Uploaded: ${image.uploadedAt.toLocaleDateString('id-ID')}`, margin + 15, yPosition + 4);
          yPosition += 10;
        }
      }
      
      yPosition += 5;
    }

    yPosition += 10;
  }

  // Overall Recommendations with better formatting
  if (data.includeRecommendations && data.overallResult?.recommendations) {
    checkPageBreak(40);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Maintenance Recommendations', margin, yPosition);
    yPosition += 15;

    data.overallResult.recommendations.forEach((rec: FaultRecommendationConfig, index: number) => {
      checkPageBreak(30);

      // Recommendation header with numbering
      doc.setFillColor(255, 248, 240); // Light orange background
      doc.rect(margin, yPosition - 3, contentWidth, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${rec.description}`, margin + 3, yPosition + 2);
      yPosition += 10;

      // Recommendation actions
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      rec.actions.forEach((action: string) => {
        checkPageBreak(8);
        const lines = doc.splitTextToSize(`• ${action}`, contentWidth - 12);
        doc.text(lines, margin + 8, yPosition);
        yPosition += lines.length * 4 + 1;
      });
      yPosition += 5;
    });
  }

  // Footer with enhanced styling
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const footerText = `DGA Analysis Report - Generated on ${new Date().toLocaleDateString('id-ID')} at ${new Date().toLocaleTimeString('id-ID')}`;
    doc.text(footerText, margin, pageHeight - 10);
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Download the PDF with enhanced filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `DGA_Analysis_${data.reportHeader.idTrafo || 'Report'}_${timestamp}.pdf`;
  doc.save(filename);
};