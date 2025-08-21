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
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // Use much larger dimensions to preserve original quality
      const maxWidth = 400;   // Much larger for original resolution
      const maxHeight = 300;  // Much larger for original resolution
      let { width, height } = img;
      
      // Calculate scaling - only scale down if image is really large
      const originalWidth = width;
      const originalHeight = height;
      const aspectRatio = width / height;
      
      // Only scale down if the image is significantly larger than our max
      if (width > maxWidth || height > maxHeight) {
        if (aspectRatio > maxWidth / maxHeight) {
          // Image is wider relative to our max dimensions
          width = maxWidth;
          height = maxWidth / aspectRatio;
        } else {
          // Image is taller relative to our max dimensions
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
      }
      
      // Don't enforce minimum size - let small images stay small
      // This preserves the original character of the image
      
      // Round to whole numbers
      width = Math.round(width);
      height = Math.round(height);
      
      // Use high resolution canvas (3x for ultra-crisp quality)
      const scale = 3; // Increased to 3x for maximum quality
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      // Configure maximum quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Scale context to match high-res canvas
      ctx.scale(scale, scale);
      
      // Fill with white background for clean appearance
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Draw image with maximum quality
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to maximum quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality (no compression)
      
      resolve({
        dataUrl,
        width,
        height
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Handle different image sources
    if (imageUrl.startsWith('blob:')) {
      img.src = imageUrl;
    } else if (imageUrl.startsWith('data:')) {
      img.src = imageUrl;
    } else {
      // For regular URLs, add timestamp to avoid cache issues
      img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
  });
};

export const generateDGAPDF = async (data: PDFGenerationData): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 15; // Reduced from 20
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15; // Reduced from 20
  const contentWidth = pageWidth - (2 * margin);

  // Helper function to check page break with tighter margins
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 25) { // Reduced bottom margin
      doc.addPage();
      yPosition = 15; // Reduced top margin for new pages
    }
  };

  // Compact Title Section
  doc.setFontSize(16); // Reduced from 18
  doc.setFont('helvetica', 'bold');
  doc.text('DGA ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
  
  // Thinner underline
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  yPosition += 10; // Reduced from 15

  // Compact Sample Data Section
  doc.setFontSize(11); // Reduced from 12
  doc.setFont('helvetica', 'bold');
  doc.text('Sample Data', margin, yPosition);
  yPosition += 7; // Reduced from 10

  // More compact table
  const headerData = [
    ['Sampling Date', data.reportHeader.samplingDate, 'Manufacture', data.reportHeader.manufacture],
    ['ID Trafo', data.reportHeader.idTrafo, 'Oil Brand', data.reportHeader.oilBrand],
    ['Serial No.', data.reportHeader.serialNo, 'Weight / Volume Oil', data.reportHeader.weightVolumeOil],
    ['Power Rating', data.reportHeader.powerRating, 'Year', data.reportHeader.year],
    ['Voltage Ratio', data.reportHeader.voltageRatio, 'Temperature', data.reportHeader.temperature],
    ['Category', data.reportHeader.category, 'Sampling Point', data.reportHeader.samplingPoint]
  ];

  const tableStartY = yPosition;
  const rowHeight = 5; // Reduced from 6
  const colWidths = [36, 46, 36, 46]; // Slightly reduced
  
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7); // Reduced from 8

  headerData.forEach((row, rowIndex) => {
    const currentY = tableStartY + (rowIndex * rowHeight);
    
    // Draw row border
    doc.rect(margin, currentY - 1, contentWidth, rowHeight);
    
    // Add data with tighter spacing
    let xPos = margin + 1.5;
    row.forEach((cell, cellIndex) => {
      if (cellIndex % 2 === 0) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.text(cell, xPos, currentY + 2.5);
      xPos += colWidths[cellIndex];
    });
  });

  yPosition = tableStartY + (headerData.length * rowHeight) + 8; // Reduced spacing

  // Compact Analysis Results Section
  checkPageBreak(25);
  doc.setFontSize(11); // Reduced from 12
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Results', margin, yPosition);
  yPosition += 8; // Reduced from 10

  for (const triangle of data.triangles) {
    checkPageBreak(45); // Reduced space requirement

    // Compact triangle header
    doc.setFillColor(245, 250, 255); // Lighter background
    doc.rect(margin, yPosition - 2, contentWidth, 6, 'F'); // Reduced height
    doc.setFontSize(10); // Reduced from 11
    doc.setFont('helvetica', 'bold');
    doc.text(`Triangle ${triangle.triangleMethod} - ${triangle.dataClassification}`, margin + 2, yPosition + 1.5);
    yPosition += 7; // Reduced from 10

    doc.setFontSize(8); // Reduced from 9
    doc.setFont('helvetica', 'normal');

    // More compact analysis result
    if (triangle.dataClassification === 'Data 1' && triangle.coAnalysisResult) {
      doc.setFont('helvetica', 'bold');
      doc.text('CO Analysis Result:', margin + 3, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 4;
      doc.text(`• Severity: ${triangle.coAnalysisResult.severity}`, margin + 6, yPosition);
      yPosition += 3;
      doc.text(`• CO Level: ${triangle.coAnalysisResult.coLevel} ppm`, margin + 6, yPosition);
      yPosition += 3;
      doc.text(`• Resampling: ${triangle.coAnalysisResult.resamplingInterval}`, margin + 6, yPosition);
      yPosition += 5;
    } else if (triangle.selectedFault) {
      doc.setFont('helvetica', 'bold');
      doc.text('Fault Analysis Result:', margin + 3, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 4;
      doc.text(`• Fault Type: ${triangle.selectedFault}`, margin + 6, yPosition);
      yPosition += 5;
    }

    // Compact gas data
    if (data.includeGasData && Object.keys(triangle.gasConcentrations).length > 0) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.text('Gas Concentrations:', margin + 3, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7); // Smaller font for gas data
      
      // More compact gas data layout
      const gasEntries = Object.entries(triangle.gasConcentrations).filter(([_, value]) => value && value > 0);
      const cols = 4; // Increased columns for better space usage
      const colWidth = contentWidth / cols;
      
      gasEntries.forEach(([gas, value], index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const xPos = margin + 6 + (col * colWidth);
        const yPos = yPosition + (row * 4); // Reduced row spacing
        
        doc.text(`${gas.toUpperCase()}: ${value}`, xPos, yPos);
      });
      
      yPosition += Math.ceil(gasEntries.length / cols) * 4 + 4;
      doc.setFontSize(8);
    }

    // Optimized image section
    if (data.includeImages && triangle.images.length > 0) {
      checkPageBreak(80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Attached Images (${triangle.images.length}):`, margin + 3, yPosition);
      yPosition += 8;
      
      for (let i = 0; i < triangle.images.length; i++) {
        const image = triangle.images[i];
        
        try {
          const { dataUrl, width, height } = await getImageBase64(image.imageUrl);
          
          // More efficient size calculation
          const maxPDFWidth = contentWidth - 10;
          const maxPDFHeight = 180; // Slightly reduced
          
          let finalWidth = width;
          let finalHeight = height;
          
          if (width > maxPDFWidth || height > maxPDFHeight) {
            const scaleRatio = Math.min(maxPDFWidth / width, maxPDFHeight / height);
            finalWidth = width * scaleRatio;
            finalHeight = height * scaleRatio;
          }
          
          const requiredSpace = finalHeight + 35; // Reduced caption space
          checkPageBreak(requiredSpace);
          
          // Center image
          const imageX = margin + (contentWidth - finalWidth) / 2;
          
          // Minimal border
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.3);
          doc.rect(imageX - 1, yPosition - 1, finalWidth + 2, finalHeight + 2);
          
          doc.addImage(dataUrl, 'JPEG', imageX, yPosition, finalWidth, finalHeight);
          
          // Compact caption
          const captionY = yPosition + finalHeight + 5;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`Image ${i + 1}`, imageX, captionY);
          
          // Show scaling info more compactly
          if (finalWidth !== width || finalHeight !== height) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.text(`(${Math.round(width)}×${Math.round(height)}→${Math.round(finalWidth)}×${Math.round(finalHeight)})`, 
                     imageX + 25, captionY);
          }
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          const sourceY = captionY + 3;
          doc.text(`${image.source === 'clipboard' ? 'Screenshot' : 'File'} • ${image.filename || 'N/A'}`, imageX, sourceY);
          doc.text(`${image.uploadedAt instanceof Date 
            ? image.uploadedAt.toLocaleDateString('id-ID') 
            : new Date(image.uploadedAt).toLocaleDateString('id-ID')
          }`, imageX, sourceY + 3);
          
          // Thin separator
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.2);
          doc.line(margin + 5, sourceY + 7, pageWidth - margin - 5, sourceY + 7);
          
          yPosition = sourceY + 12;
          
        } catch (error) {
          // Compact error display
          checkPageBreak(25);
          
          doc.setFillColor(255, 248, 248);
          doc.rect(margin + 3, yPosition - 1, contentWidth - 6, 20, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(180, 60, 60);
          doc.text(`⚠ Image ${i + 1} Error`, margin + 6, yPosition + 3);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(0, 0, 0);
          doc.text(`${image.source} • ${image.filename || 'N/A'}`, margin + 8, yPosition + 7);
          doc.text(`${image.uploadedAt instanceof Date 
            ? image.uploadedAt.toLocaleDateString('id-ID') 
            : new Date(image.uploadedAt).toLocaleDateString('id-ID')
          }`, margin + 8, yPosition + 10);
          
          yPosition += 22;
        }
      }
      
      yPosition += 5;
    }

    yPosition += 6; // Reduced spacing between triangles
  }

  // Compact Recommendations section
  if (data.includeRecommendations && data.overallResult?.recommendations) {
    checkPageBreak(30);

    doc.setFontSize(12); // Reduced from 16
    doc.setFont('helvetica', 'bold');
    doc.text('Maintenance Recommendations', margin, yPosition);
    yPosition += 10; // Reduced from 15

    data.overallResult.recommendations.forEach((rec: FaultRecommendationConfig, index: number) => {
      checkPageBreak(25); // Reduced space requirement

      // Compact recommendation header
      doc.setFillColor(252, 248, 240); // Very light orange
      doc.rect(margin, yPosition - 2, contentWidth, 6, 'F'); // Reduced height
      doc.setFontSize(9); // Reduced from 11
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${rec.description}`, margin + 2, yPosition + 1.5);
      yPosition += 7; // Reduced from 10

      // Compact recommendation actions
      doc.setFontSize(7); // Reduced from 9
      doc.setFont('helvetica', 'normal');
      rec.actions.forEach((action: string) => {
        checkPageBreak(6);
        const lines = doc.splitTextToSize(`• ${action}`, contentWidth - 8);
        doc.text(lines, margin + 4, yPosition); // Reduced margin
        yPosition += lines.length * 3 + 1; // Reduced line spacing
      });
      yPosition += 3; // Reduced spacing between recommendations
    });
  }

  // Compact Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Thinner footer line
    doc.setLineWidth(0.1);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15); // Moved up
    
    doc.setFontSize(6); // Reduced from 7
    doc.setFont('helvetica', 'normal');
    const footerText = `DGA Analysis Report - Generated ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}`;
    doc.text(footerText, margin, pageHeight - 8); // Moved up
    
    // Compact page number
    doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' }); // Simplified format
  }

  // Optimized filename
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, ''); // Shorter timestamp
  const filename = `DGA_${data.reportHeader.idTrafo || 'Report'}_${timestamp}.pdf`;
  doc.save(filename);
};