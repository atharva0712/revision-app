import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { URL } from 'url';

// --- Type Definitions -- - 

// Import shared type definitions
import type { Content } from '../types/index.js';

// Define PDFData interface based on pdf-parse library structure
interface PDFData {
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  version: string;
  text: string;
}

// Defines the structure of metadata extracted from a PDF
interface PdfInfo {
  pages: number;
  version: string | null;
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  modificationDate: string | null;
}

interface ExtractedPdfText {
  text: string;
  wordCount: number;
  info: PdfInfo;
}


class ContentExtractor {
  private readonly maxPdfSize: number = 10 * 1024 * 1024; // 10MB
  private readonly requestTimeout: number = 30000; // 30 seconds

  /**
   * Main method to process content. If it contains a PDF URL, it downloads,
   * extracts text, and returns an enhanced content object.
   * @param content The initial content object.
   * @returns An enhanced content object or the original on failure.
   */
  public async processPDF(content: Content): Promise<Content> {
    try {
      console.log('Processing PDF content...');
      const pdfUrl = this.extractPdfUrl(content.text);

      if (!pdfUrl) {
        console.log('No PDF URL found, returning original content.');
        return content;
      }

      const pdfText = await this.extractPDFFromUrl(pdfUrl);

      const enhancedContent: Content = {
        ...content,
        text: pdfText.text,
        wordCount: pdfText.wordCount,
        metadata: {
          ...content.metadata,
          originalPdfUrl: pdfUrl,
          pdfInfo: pdfText.info,
          processedAt: new Date().toISOString(),
        },
      };

      console.log(`PDF processed successfully: ${pdfText.wordCount} words extracted.`);
      return enhancedContent;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('PDF processing failed:', errorMessage);

      // Return original content with error info
      return {
        ...content,
        text: content.text.replace(/^PDF_URL:.*\n?/, '') + '\n[PDF processing failed - using fallback content]',
        metadata: {
          ...content.metadata,
          pdfProcessingError: errorMessage,
          processedAt: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Extracts a PDF URL from a given string.
   */
  private extractPdfUrl(text: string | null): string | null {
    if (!text) return null;

    const prefixMatch = text.match(/^PDF_URL:\s*(.+)$/m);
    if (prefixMatch && prefixMatch[1]) {
      return prefixMatch[1].trim();
    }

    const urlMatch = text.match(/https?:\/\/[^\s]+\.pdf/i);
    if (urlMatch && urlMatch[0]) {
      return urlMatch[0];
    }

    return null;
  }

  /**
   * Downloads and parses a PDF from a URL.
   */
  private async extractPDFFromUrl(pdfUrl: string): Promise<ExtractedPdfText> {
    try {
      console.log(`Downloading PDF from: ${pdfUrl}`);
      new URL(pdfUrl); // Validates URL format

      const response: AxiosResponse<ArrayBuffer> = await axios({
        method: 'GET',
        url: pdfUrl,
        responseType: 'arraybuffer',
        timeout: this.requestTimeout,
        maxContentLength: this.maxPdfSize,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Learning-Content-Extractor/1.0)',
          Accept: 'application/pdf,application/octet-stream,*/*',
        },
      });
      
      console.log(`PDF downloaded: ${response.data.byteLength} bytes`);
      
      // Dynamic import to avoid pdf-parse initialization issues
      const pdfParse = await import('pdf-parse');
      const pdfData: PDFData = await pdfParse.default(Buffer.from(response.data));
      const cleanText = this.formatPdfContent(pdfData);
      const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

      return {
        text: cleanText,
        wordCount: wordCount,
        info: {
          pages: pdfData.numpages,
          version: pdfData.version,
          title: pdfData.info?.Title || null,
          author: pdfData.info?.Author || null,
          subject: pdfData.info?.Subject || null,
          creator: pdfData.info?.Creator || null,
          producer: pdfData.info?.Producer || null,
          creationDate: pdfData.info?.CreationDate || null,
          modificationDate: pdfData.info?.ModDate || null,
        },
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') throw new Error('PDF download timeout');
        if (error.response?.status === 404) throw new Error('PDF not found (404)');
        if (error.response?.status === 403) throw new Error('PDF access forbidden (403)');
        if (error.message.includes('maxContentLength')) throw new Error('PDF file is too large (>10MB)');
      }
      if (error instanceof Error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during PDF extraction');
    }
  }

  /**
   * Cleans and formats raw text extracted from a PDF.
   */
  private cleanPdfText(rawText: string | null): string {
    if (!rawText) return '';

    let cleanText = rawText
      .replace(/\s+/g, ' ') // Consolidate whitespace
      .replace(/([a-z])-\s+([a-z])/gi, '$1$2') // Re-join hyphenated words
      .replace(/\s+[a-zA-Z]\s+/g, ' ') // Remove standalone single characters
      .trim();

    // Filter out very short lines (likely headers/footers)
    const lines = cleanText.split('\n');
    const filteredLines = lines.filter(line => line.trim().length > 15);
    
    return filteredLines.join('\n').trim();
  }

  /**
   * Formats the final PDF content with metadata and cleaning.
   */
  private formatPdfContent(pdfData: PDFData): string {
    if (!pdfData.text) return '';
    let formattedText = pdfData.text;

    // Prepend metadata to the text if available
    const metadataHeader: string[] = [];
    if (pdfData.info?.Title) metadataHeader.push(`Title: ${pdfData.info.Title}`);
    if (pdfData.info?.Author) metadataHeader.push(`Author: ${pdfData.info.Author}`);
    if (pdfData.numpages) metadataHeader.push(`Pages: ${pdfData.numpages}`);

    if (metadataHeader.length > 0) {
      formattedText = metadataHeader.join('\n') + '\n\n' + formattedText;
    }

    return this.cleanPdfText(formattedText);
  }
}

// Export a singleton instance of the class
export const contentExtractor = new ContentExtractor();
