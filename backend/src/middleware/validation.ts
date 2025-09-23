import type express from 'express';
import { URL } from 'url';

// An interface defining the expected shape of the request body for content validation.
interface ContentRequestBody {
  url: string;
  title: string;
  type: string;
  text: string;
  wordCount?: number;
}

/**
 * Express middleware to validate the request body for content processing.
 * Checks for required fields, validates formats, and enriches the request body.
 */
export const validateContent = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // Cast req.body to our defined interface for type safety.
  const { url, title, type, text } = req.body as ContentRequestBody;

  // 1. Check for required fields
  if (!url || !title || !type || !text) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: url, title, type, text',
    });
    return;
  }

  // 2. Validate URL format
  try {
    new URL(url);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL format',
    });
    return;
  }

  // 3. Validate content type
  const validTypes: string[] = ['article', 'webpage', 'pdf'];
  if (!validTypes.includes(type)) {
    res.status(400).json({
      success: false,
      error: `Invalid content type. Must be one of: ${validTypes.join(', ')}`,
    });
    return;
  }

  // 4. Validate text length
  if (typeof text !== 'string' || text.trim().length < 10) {
    res.status(400).json({
      success: false,
      error: 'Content text must be at least 10 characters long',
    });
    return;
  }
  
  // 5. Validate title length
  if (typeof title !== 'string' || title.trim().length < 3) {
    res.status(400).json({
      success: false,
      error: 'Title must be at least 3 characters long',
    });
    return;
  }

  // 6. Enrich body with word count if not provided
  if (!req.body.wordCount) {
    req.body.wordCount = text.trim().split(/\s+/).length;
  }

  // If all checks pass, proceed to the next middleware or handler.
  next();
};

/**
 * A standardized error handler utility.
 * @param error The error object caught in a try-catch block.
 * @param res The Express response object.
 */
export const handleError = (error: unknown, res: express.Response): void => {
  console.error('API Error:', error);

  // Type guard to safely access error properties
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Specific error types based on message content
    if (errorMessage.includes('timeout')) {
      res.status(408).json({ success: false, error: 'Request timeout' });
      return;
    }
    if (errorMessage.includes('rate limit')) {
      res.status(429).json({ success: false, error: 'Rate limit exceeded' });
      return;
    }
    if (errorMessage.includes('pdf')) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    // Check for Node.js system error codes
    if ('code' in error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOTFOUND' || nodeError.code === 'ECONNREFUSED') {
        res.status(503).json({ success: false, error: 'External service unavailable' });
        return;
      }
    }
  }

  // Generic fallback for all other errors
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred',
  });
};