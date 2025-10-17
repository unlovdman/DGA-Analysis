import { jsPDF } from 'jspdf';
import type { ReportHeader, ManualTriangleData, FaultRecommendationConfig, BreakdownVoltageData } from '../types';
import type { AnalysisResult } from './duvalAnalysis';
import { BREAKDOWN_VOLTAGE_PREVENTIVE_MAINTENANCE } from '../data/breakdownVoltage';

interface PDFGenerationData {
  reportHeader: ReportHeader;
  triangles: ManualTriangleData[];
  overallResult: AnalysisResult | null;
  includeImages: boolean;
  includeGasData: boolean;
  includeRecommendations: boolean;
}

interface BreakdownVoltagePDFData {
  breakdownData: BreakdownVoltageData;
  transformerRange: {
    type: string;
    label: string;
    voltageRange: string;
    good: string;
    fair: string;
    poor: string;
  };
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
      doc.setFontSize(10); // Increased from 9
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${rec.description}`, margin + 2, yPosition + 1.5);
      yPosition += 7; // Reduced from 10

      // Compact recommendation actions
      doc.setFontSize(8); // Increased from 7
      doc.setFont('helvetica', 'normal');
      rec.actions.forEach((action: string) => {
        checkPageBreak(6);
        const lines = doc.splitTextToSize(`• ${action}`, contentWidth - 8);
        lines.forEach((line: string) => {
          doc.text(line, margin + 4, yPosition, { align: 'justify', maxWidth: contentWidth - 8 }); // Added justify alignment
          yPosition += 4; // Increased line spacing from 3
        });
        yPosition += 1; // Reduced spacing between recommendations
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

export const generateBreakdownVoltagePDF = async (data: BreakdownVoltagePDFData): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);

  // Helper function to check page break
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPosition = 15;
    }
  };

  // Title Section - more compact
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Hasil Pengujian Breakdown Voltage', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Transformer Information Section (moved to top before introduction)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Transformator', margin, yPosition);
  yPosition += 8;

  const basicInfo = [
    ['ID Transformator', data.breakdownData.idTrafo || 'N/A'],
    ['Jenis Transformator', `Type ${data.breakdownData.transformerType} (${data.transformerRange.voltageRange})`],
    ['Tanggal Analisis', data.breakdownData.createdAt instanceof Date 
      ? data.breakdownData.createdAt.toLocaleDateString('id-ID') 
      : new Date(data.breakdownData.createdAt).toLocaleDateString('id-ID')],
    ['Standar Pengujian', 'IEC 60156-95 dengan batasan IEC 60422:2013']
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  basicInfo.forEach((row, index) => {
    const currentY = yPosition + (index * 5);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0] + ':', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], margin + 45, currentY);
  });

  yPosition += basicInfo.length * 5 + 15;

  // Introduction paragraph - smaller
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const introText = 'Berikut ini adalah hasil pengujian Breakdown Voltage menggunakan standar IEC 60156-95 dengan batasan IEC 60422:2013:';
  doc.text(introText, margin, yPosition);
  yPosition += 15;

  // Table with dielectric strength measurements - more compact
  checkPageBreak(60);
  
  // Define table structure
  const tableData = [
    ['Oil Analysis', 'Dielectric Strength', 'Hasil'],
    ['Breakdown Voltage/', '5 Menit', `${data.breakdownData.dielectricStrengths[0]} kV`],
    ['Tegangan Tembus', '2 Menit', `${data.breakdownData.dielectricStrengths[1]} kV`],
    ['(kV/2,5 mm)', '2 Menit', `${data.breakdownData.dielectricStrengths[2]} kV`],
    ['', '2 Menit', `${data.breakdownData.dielectricStrengths[3]} kV`],
    ['', '2 Menit', `${data.breakdownData.dielectricStrengths[4]} kV`],
    ['', '2 Menit', `${data.breakdownData.dielectricStrengths[5]} kV`],
    ['', 'Average', `${data.breakdownData.average} kV`]
  ];

  const tableStartY = yPosition;
  const rowHeight = 6; // Reduced from 8
  const colWidths = [55, 45, 40]; // Slightly reduced
  
  // Draw table with both horizontal and vertical lines
  doc.setLineWidth(0.3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8); // Reduced from 10

  tableData.forEach((row, rowIndex) => {
    const currentY = tableStartY + (rowIndex * rowHeight);
    
    // Draw horizontal lines
    if (rowIndex === 0) {
      // Top border of header
      doc.line(margin, currentY, margin + colWidths[0] + colWidths[1] + colWidths[2], currentY);
      // Bottom border of header
      doc.line(margin, currentY + rowHeight, margin + colWidths[0] + colWidths[1] + colWidths[2], currentY + rowHeight);
    } else if (rowIndex === tableData.length - 1) {
      // Bottom border of table
      doc.line(margin, currentY + rowHeight, margin + colWidths[0] + colWidths[1] + colWidths[2], currentY + rowHeight);
    } else {
      // Add horizontal row lines ONLY for Dielectric Strength and Hasil columns (not Oil Analysis)
      const startX = margin + colWidths[0]; // Start after Oil Analysis column
      const endX = margin + colWidths[0] + colWidths[1] + colWidths[2]; // End of table
      doc.line(startX, currentY + rowHeight, endX, currentY + rowHeight);
    }
    
    // Draw cell content
    let xPos = margin;
    row.forEach((cell, cellIndex) => {
      const cellWidth = colWidths[cellIndex];
      
      // Draw vertical lines for column separation
      if (cellIndex === 0) {
        // Left border of table
        doc.line(xPos, tableStartY, xPos, tableStartY + (tableData.length * rowHeight));
      }
      // Right border of each column
      doc.line(xPos + cellWidth, tableStartY, xPos + cellWidth, tableStartY + (tableData.length * rowHeight));
      
      // Set font style for header row
      if (rowIndex === 0) {
        doc.setFont('helvetica', 'bold');
      } else if (rowIndex === tableData.length - 1) {
        // Average row - make it bold
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      // Center align text in cells
      const textX = xPos + cellWidth / 2;
      const textY = currentY + 4; // Adjusted for smaller row height
      
      if (cell) { // Only draw text if cell is not empty
        doc.text(cell, textX, textY, { align: 'center' });
      }
      
      xPos += cellWidth;
    });
  });

  yPosition = tableStartY + (tableData.length * rowHeight) + 15;

  // Analysis result paragraph - more compact
  checkPageBreak(40);
  doc.setFontSize(9); // Reduced from 11
  doc.setFont('helvetica', 'normal');
  
  const resultText = `Dari hasil pengujian Breakdown Voltage (Tegangan Tembus), diperoleh nilai ${data.breakdownData.average} kV. Berdasarkan batasan IEC 60422:2013 transformator tenaga ${data.breakdownData.idTrafo || 'ini'} termasuk jenis trafo ${data.breakdownData.transformerType} (${data.transformerRange.voltageRange}), yang dimana nilai tegangan tembus ${data.breakdownData.average} kV termasuk dalam kondisi ${data.breakdownData.result === 'good' ? 'baik' : data.breakdownData.result === 'fair' ? 'cukup' : 'buruk'}. Kondisi kualitas isolasi tegangan tembus dalam kategori ${data.breakdownData.result === 'good' ? 'baik' : data.breakdownData.result === 'fair' ? 'fair' : 'buruk'} yang dimana minyak isolasi ${data.breakdownData.result === 'good' ? 'berfungsi dengan baik dan memenuhi standar' : data.breakdownData.result === 'fair' ? 'masih berfungsi, tetapi kualitasnya menurun' : 'memerlukan perhatian khusus dan perbaikan segera'}. Oleh karena itu, rekomendasi berdasarkan hasil analisis yaitu ${data.breakdownData.recommendation.toLowerCase()} dengan tindakan pemeliharaan preventif ${BREAKDOWN_VOLTAGE_PREVENTIVE_MAINTENANCE[data.breakdownData.result]}.`;

  // Split text into justified lines
  const words = resultText.split(' ');
  let currentLine = '';
  const justifiedLines: string[] = [];
  
  words.forEach((word, index) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = doc.getTextWidth(testLine);
    
    if (textWidth > contentWidth - 10 && currentLine) {
      // Add current line and start new one
      justifiedLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
    
    // Add last line
    if (index === words.length - 1) {
      justifiedLines.push(currentLine);
    }
  });

  // Render justified text
  justifiedLines.forEach((line: string, index: number) => {
    checkPageBreak(5);
    if (index < justifiedLines.length - 1) {
      // Justify all lines except the last one
      const words = line.split(' ');
      if (words.length > 1) {
        const totalWordWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
        const totalSpaceWidth = contentWidth - 10 - totalWordWidth;
        const spaceWidth = totalSpaceWidth / (words.length - 1);
        
        let xPos = margin;
        words.forEach((word, wordIndex) => {
          doc.text(word, xPos, yPosition);
          if (wordIndex < words.length - 1) {
            xPos += doc.getTextWidth(word) + spaceWidth;
          }
        });
      } else {
        doc.text(line, margin, yPosition);
      }
    } else {
      // Last line - left aligned
      doc.text(line, margin, yPosition);
    }
    yPosition += 4.5;
  });

  yPosition += 10;

  // Standards Reference - more compact
  checkPageBreak(25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Referensi Standar', margin, yPosition);
  yPosition += 8;

  const standards = [
    '• IEC 60156-95: Insulating liquids - Determination of the breakdown voltage at power frequency - Test method',
    '• IEC 60422:2013: Mineral insulating oils in electrical equipment - Supervision and maintenance guidance'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7); // Smaller font
  
  standards.forEach((standard) => {
    checkPageBreak(6);
    
    // Split text into justified lines
    const words = standard.split(' ');
    let currentLine = '';
    const justifiedLines: string[] = [];
    
    words.forEach((word, index) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = doc.getTextWidth(testLine);
      
      if (textWidth > contentWidth - 10 && currentLine) {
        // Add current line and start new one
        justifiedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
      
      // Add last line
      if (index === words.length - 1) {
        justifiedLines.push(currentLine);
      }
    });

    // Render justified text
    justifiedLines.forEach((line: string, index: number) => {
      checkPageBreak(4);
      if (index < justifiedLines.length - 1) {
        // Justify all lines except the last one
        const words = line.split(' ');
        if (words.length > 1) {
          const totalWordWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
          const totalSpaceWidth = contentWidth - 10 - totalWordWidth;
          const spaceWidth = totalSpaceWidth / (words.length - 1);
          
          let xPos = margin;
          words.forEach((word, wordIndex) => {
            doc.text(word, xPos, yPosition);
            if (wordIndex < words.length - 1) {
              xPos += doc.getTextWidth(word) + spaceWidth;
            }
          });
        } else {
          doc.text(line, margin, yPosition);
        }
      } else {
        // Last line - left aligned
        doc.text(line, margin, yPosition);
      }
      yPosition += 4;
    });
    yPosition += 2;
  });

  // Footer
  yPosition = pageHeight - 15;
    doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(`Report generated on ${new Date().toLocaleDateString('id-ID')} at ${new Date().toLocaleTimeString('id-ID')}`, 
    pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Breakdown_Voltage_Analysis_${data.breakdownData.idTrafo || 'Report'}_${timestamp}.pdf`;
  doc.save(filename);
};

// New function for bulk PDF export from history
export const generateBulkBreakdownVoltagePDF = async (historyItems: any[]): Promise<void> => {
  if (historyItems.length === 0) {
    throw new Error('No history items provided for bulk export');
  }

  const doc = new jsPDF();
  let isFirstPage = true;

  for (let i = 0; i < historyItems.length; i++) {
    const historyItem = historyItems[i];
    
    // Add new page for each analysis (except the first)
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    let yPosition = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Helper function to check page break
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 25) {
        doc.addPage();
        yPosition = 15;
      }
    };

    // Get transformer range info
    const transformerType = historyItem.breakdownData.transformerType;
    let transformerRange = { voltageRange: '', good: '', fair: '', poor: '' };
    
    // Define transformer ranges (you might want to import this from breakdownVoltage.ts)
    const ranges = {
      'O': { voltageRange: '> 400KV', good: '> 60', fair: '50-60', poor: '< 50' },
      'A': { voltageRange: '170-400KV', good: '> 60', fair: '50-60', poor: '< 50' },
      'B': { voltageRange: '72.5KV', good: '> 50', fair: '40-50', poor: '< 40' },
      'C': { voltageRange: '< 72.5KV', good: '> 40', fair: '30-40', poor: '< 30' }
    };
    
    transformerRange = ranges[transformerType as keyof typeof ranges] || ranges['C'];

    // Page header with analysis number
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Breakdown Voltage Analysis ${i + 1} of ${historyItems.length}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Title Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Hasil Pengujian Breakdown Voltage', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Transformer Information Section (moved before introduction)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informasi Transformator', margin, yPosition);
    yPosition += 8;

    const basicInfo = [
      ['ID Transformator', historyItem.breakdownData.idTrafo || 'N/A'],
      ['Jenis Transformator', `Type ${historyItem.breakdownData.transformerType} (${transformerRange.voltageRange})`],
      ['Tanggal Analisis', new Date(historyItem.createdAt).toLocaleDateString('id-ID')],
      ['Standar Pengujian', 'IEC 60156-95 dengan batasan IEC 60422:2013']
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    basicInfo.forEach((row, index) => {
      const currentY = yPosition + (index * 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[0] + ':', margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(row[1], margin + 45, currentY);
    });

    yPosition += basicInfo.length * 5 + 15;

    // Introduction paragraph
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const introText = 'Berikut ini adalah hasil pengujian Breakdown Voltage menggunakan standar IEC 60156-95 dengan batasan IEC 60422:2013:';
    doc.text(introText, margin, yPosition);
    yPosition += 15;

    // Table with dielectric strength measurements
    const tableData = [
      ['Oil Analysis', 'Dielectric Strength', 'Hasil'],
      ['Breakdown Voltage/', '5 Menit', `${historyItem.breakdownData.dielectricStrengths[0]} kV`],
      ['Tegangan Tembus', '2 Menit', `${historyItem.breakdownData.dielectricStrengths[1]} kV`],
      ['(kV/2,5 mm)', '2 Menit', `${historyItem.breakdownData.dielectricStrengths[2]} kV`],
      ['', '2 Menit', `${historyItem.breakdownData.dielectricStrengths[3]} kV`],
      ['', '2 Menit', `${historyItem.breakdownData.dielectricStrengths[4]} kV`],
      ['', '2 Menit', `${historyItem.breakdownData.dielectricStrengths[5]} kV`],
      ['', 'Average', `${historyItem.breakdownData.average} kV`]
    ];

    const tableStartY = yPosition;
    const rowHeight = 6;
    const colWidths = [55, 45, 40];
    
    // Draw table with both horizontal and vertical lines
    doc.setLineWidth(0.3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    tableData.forEach((row, rowIndex) => {
      const currentY = tableStartY + (rowIndex * rowHeight);
      
      // Draw horizontal lines
      if (rowIndex === 0) {
        doc.line(margin, currentY, margin + colWidths[0] + colWidths[1] + colWidths[2], currentY);
        doc.line(margin, currentY + rowHeight, margin + colWidths[0] + colWidths[1] + colWidths[2], currentY + rowHeight);
      } else if (rowIndex === tableData.length - 1) {
        doc.line(margin, currentY + rowHeight, margin + colWidths[0] + colWidths[1] + colWidths[2], currentY + rowHeight);
      } else {
        // Add horizontal row lines ONLY for Dielectric Strength and Hasil columns (not Oil Analysis)
        const startX = margin + colWidths[0]; // Start after Oil Analysis column
        const endX = margin + colWidths[0] + colWidths[1] + colWidths[2]; // End of table
        doc.line(startX, currentY + rowHeight, endX, currentY + rowHeight);
      }
      
      let xPos = margin;
      row.forEach((cell, cellIndex) => {
        const cellWidth = colWidths[cellIndex];
        
        // Draw vertical lines for column separation
        if (cellIndex === 0) {
          // Left border of table
          doc.line(xPos, tableStartY, xPos, tableStartY + (tableData.length * rowHeight));
        }
        // Right border of each column
        doc.line(xPos + cellWidth, tableStartY, xPos + cellWidth, tableStartY + (tableData.length * rowHeight));
        
        if (rowIndex === 0) {
          doc.setFont('helvetica', 'bold');
        } else if (rowIndex === tableData.length - 1) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const textX = xPos + cellWidth / 2;
        const textY = currentY + 4;
        
        if (cell) {
          doc.text(cell, textX, textY, { align: 'center' });
        }
        
        xPos += cellWidth;
      });
    });

    yPosition = tableStartY + (tableData.length * rowHeight) + 15;

    // Analysis result paragraph
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const resultText = `Dari hasil pengujian Breakdown Voltage (Tegangan Tembus), diperoleh nilai ${historyItem.breakdownData.average} kV. Berdasarkan batasan IEC 60422:2013 transformator tenaga ${historyItem.breakdownData.idTrafo || 'ini'} termasuk jenis trafo ${historyItem.breakdownData.transformerType} (${transformerRange.voltageRange}), yang dimana nilai tegangan tembus ${historyItem.breakdownData.average} kV termasuk dalam kondisi ${historyItem.breakdownData.result === 'good' ? 'baik' : historyItem.breakdownData.result === 'fair' ? 'cukup' : 'buruk'}. Kondisi kualitas isolasi tegangan tembus dalam kategori ${historyItem.breakdownData.result === 'good' ? 'baik' : historyItem.breakdownData.result === 'fair' ? 'fair' : 'buruk'} yang dimana minyak isolasi ${historyItem.breakdownData.result === 'good' ? 'berfungsi dengan baik dan memenuhi standar' : historyItem.breakdownData.result === 'fair' ? 'masih berfungsi, tetapi kualitasnya menurun' : 'memerlukan perhatian khusus dan perbaikan segera'}. Oleh karena itu, rekomendasi berdasarkan hasil analisis yaitu ${historyItem.breakdownData.recommendation.toLowerCase()}`;

    // Split text into justified lines
    const words = resultText.split(' ');
    let currentLine = '';
    const justifiedLines: string[] = [];
    
    words.forEach((word, index) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = doc.getTextWidth(testLine);
      
      if (textWidth > contentWidth - 10 && currentLine) {
        // Add current line and start new one
        justifiedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
      
      // Add last line
      if (index === words.length - 1) {
        justifiedLines.push(currentLine);
      }
    });

    // Render justified text
    justifiedLines.forEach((line: string, index: number) => {
      checkPageBreak(5);
      if (index < justifiedLines.length - 1) {
        // Justify all lines except the last one
        const words = line.split(' ');
        if (words.length > 1) {
          const totalWordWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
          const totalSpaceWidth = contentWidth - 10 - totalWordWidth;
          const spaceWidth = totalSpaceWidth / (words.length - 1);
          
          let xPos = margin;
          words.forEach((word, wordIndex) => {
            doc.text(word, xPos, yPosition);
            if (wordIndex < words.length - 1) {
              xPos += doc.getTextWidth(word) + spaceWidth;
            }
          });
        } else {
          doc.text(line, margin, yPosition);
        }
      } else {
        // Last line - left aligned
        doc.text(line, margin, yPosition);
      }
      yPosition += 4.5;
    });

    yPosition += 10;

    // Standards Reference
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Referensi Standar', margin, yPosition);
    yPosition += 8;

    const standards = [
      '• IEC 60156-95: Insulating liquids - Determination of the breakdown voltage at power frequency - Test method',
      '• IEC 60422:2013: Mineral insulating oils in electrical equipment - Supervision and maintenance guidance'
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    standards.forEach((standard) => {
      checkPageBreak(6);
      
      // Split text into justified lines
      const words = standard.split(' ');
      let currentLine = '';
      const justifiedLines: string[] = [];
      
      words.forEach((word, index) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > contentWidth - 10 && currentLine) {
          // Add current line and start new one
          justifiedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
        
        // Add last line
        if (index === words.length - 1) {
          justifiedLines.push(currentLine);
        }
      });

      // Render justified text
      justifiedLines.forEach((line: string, index: number) => {
        checkPageBreak(4);
        if (index < justifiedLines.length - 1) {
          // Justify all lines except the last one
          const words = line.split(' ');
          if (words.length > 1) {
            const totalWordWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
            const totalSpaceWidth = contentWidth - 10 - totalWordWidth;
            const spaceWidth = totalSpaceWidth / (words.length - 1);
            
            let xPos = margin;
            words.forEach((word, wordIndex) => {
              doc.text(word, xPos, yPosition);
              if (wordIndex < words.length - 1) {
                xPos += doc.getTextWidth(word) + spaceWidth;
              }
            });
          } else {
            doc.text(line, margin, yPosition);
          }
        } else {
          // Last line - left aligned
          doc.text(line, margin, yPosition);
        }
        yPosition += 4;
      });
      yPosition += 2;
    });

    // Footer for each page
    const footerY = pageHeight - 15;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(`Analysis ${i + 1}/${historyItems.length} - Generated on ${new Date().toLocaleDateString('id-ID')}`, 
      pageWidth / 2, footerY, { align: 'center' });
  }

  // Save the bulk PDF
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Bulk_Breakdown_Voltage_Analysis_${historyItems.length}_Reports_${timestamp}.pdf`;
  doc.save(filename);
};