// Shared type definitions for the application

// Define the structure for input content
export interface Content {
  title: string;
  type: string;
  text: string;
  url: string;
  wordCount?: number;
  metadata?: Record<string, any>;
}

// Define the structure for the final, validated topic object
export interface Topic {
  id: string;
  name: string;
  description: string;
  confidence: number;
  category: string;
  keywords: string[];
  extractedFrom: {
    url: string;
    title: string;
    type: string;
    extractedAt: string;
  };
}

// Base interface for content used in batch processing
export interface BatchContent extends Content {}

// Defines the result for a single item in a batch process
export interface BatchResult {
  url: string;
  success: boolean;
  topics?: Topic[];
  contentInfo?: {
    title: string;
    type: string;
    wordCount: number;
  };
  error?: string;
}