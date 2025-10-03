// PDF Generation Library for Contracts
// Uses jsPDF for generating PDF documents from contract content

import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
}

/**
 * Generate a PDF from contract content
 * @param content - The contract content as plain text
 * @param filename - The filename for the PDF (without extension)
 * @param options - Optional PDF metadata
 */
export function generateContractPDF(
  content: string, 
  filename: string, 
  options: PDFGenerationOptions = {}
): void {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set PDF metadata
    if (options.title) doc.setProperties({ title: options.title });
    if (options.author) doc.setProperties({ author: options.author });
    if (options.subject) doc.setProperties({ subject: options.subject });
    if (options.keywords) doc.setProperties({ keywords: options.keywords });
    if (options.creator) doc.setProperties({ creator: options.creator });

    // Set font and size
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Split content into lines and process
    const lines = content.split('\n');
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Add title - extract from content or use default
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const firstLine = lines.find(line => line.trim() !== '') || 'DOKUMENT';
    doc.text(firstLine.toUpperCase(), margin, yPosition);
    yPosition += 15;

    // Reset font for content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines but add some spacing
      if (line === '') {
        yPosition += lineHeight / 2;
        continue;
      }

      // Check if we need a new page
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Handle long lines by splitting them
      const maxWidth = doc.internal.pageSize.width - (margin * 2);
      const splitLines = doc.splitTextToSize(line, maxWidth);
      
      if (Array.isArray(splitLines)) {
        // Multiple lines
        for (let j = 0; j < splitLines.length; j++) {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(splitLines[j], margin, yPosition);
          yPosition += lineHeight;
        }
      } else {
        // Single line
        doc.text(splitLines, margin, yPosition);
        yPosition += lineHeight;
      }
    }

    // Add footer with generation date
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Generirano: ${new Date().toLocaleDateString('hr-HR')} - Stranica ${i} od ${pageCount}`,
        margin,
        pageHeight - 10
      );
    }

    // Save the PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Greška pri generiranju PDF-a');
  }
}

/**
 * Generate a PDF from HTML content (alternative method)
 * @param htmlContent - The HTML content to convert to PDF
 * @param filename - The filename for the PDF (without extension)
 * @param options - Optional PDF metadata
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  filename: string,
  options: PDFGenerationOptions = {}
): Promise<void> {
  try {
    // This would require html2canvas and more complex setup
    // For now, we'll use the text-based approach
    const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML tags
    generateContractPDF(textContent, filename, options);
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error('Greška pri generiranju PDF-a iz HTML-a');
  }
}

/**
 * Format contract content for better PDF display
 * @param content - Raw contract content
 * @returns Formatted content with proper spacing
 */
export function formatContentForPDF(content: string): string {
  return content
    .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines
    .replace(/^\s+|\s+$/gm, '') // Trim each line
    .replace(/\n{3,}/g, '\n\n'); // Limit to max 2 consecutive newlines
}
