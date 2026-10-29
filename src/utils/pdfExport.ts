import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PDFExportOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  title?: string;
  tryShare?: boolean;
}

export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<boolean> {
  const orientation = options.orientation || 'portrait';
  
  // Clone element or render with optimal scale
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: orientation === 'landscape' ? 1123 : 794,
  });

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const availWidth = pageWidth - margin * 2;
  const availHeight = pageHeight - margin * 2;

  const ratio = Math.min(availWidth / canvas.width, availHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  const imgData = canvas.toDataURL('image/jpeg', 0.88);
  pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');

  const cleanFilename = options.filename.endsWith('.pdf')
    ? options.filename
    : `${options.filename}.pdf`;

  const blob = pdf.output('blob');
  const file = new File([blob], cleanFilename, { type: 'application/pdf' });

  // Check if native Web Share is supported with files
  if (
    options.tryShare &&
    navigator.share &&
    (!navigator.canShare || navigator.canShare({ files: [file] }))
  ) {
    try {
      await navigator.share({
        title: options.title || cleanFilename,
        files: [file],
      });
      return true;
    } catch (e: any) {
      if (e?.name === 'AbortError') return true;
      console.warn('Native share failed, falling back to download', e);
    }
  }

  // Fallback download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return true;
}
