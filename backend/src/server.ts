import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import { validateContent, handleError } from "./middleware/validation.js";
import authRoutes from "./routes/auth.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import progressRoutes from './routes/progress.routes';
import { topicExtractor } from "./services/topicExtractor.js";
import { contentExtractor } from "./services/pdfExtractor.js";

import type { Content, Topic, BatchContent, BatchResult } from "./types/index.js";

// --- Server Setup ---

dotenv.config();
connectDB(); // Connect to MongoDB
const app = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// --- Core Middleware ---

app.use(helmet()); // Basic security headers
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Logger for development

// CORS configuration for browser extensions and local development
app.use(
  cors({
    origin: [
      "chrome-extension://*",
      "moz-extension://*",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8000",
      "http://localhost:5173",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

// Body parsers with increased limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Use Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use('/api/progress', progressRoutes);

// Rate limiting for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// --- API Routes ---

// Health check endpoint
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      openai: !!process.env.OPENAI_API_KEY,
    },
  });
});

// Main endpoint for extracting topics from provided content
app.post(
  "/api/extract-topics",
  validateContent,
  async (req: express.Request, res: express.Response) => {
    try {
      console.log(`Received request for: ${req.body.url} (${req.body.type})`);

      let processedContent: Content = req.body;

      // If it's a PDF, run it through the content extractor service first
      if (
        processedContent.type === "pdf" &&
        processedContent.text.includes("PDF_URL:")
      ) {
        console.log("PDF detected, processing with contentExtractor...");
        processedContent = await contentExtractor.processPDF(processedContent);
      }

      const topics = await topicExtractor.extractTopics(processedContent);
      console.log(
        `Successfully extracted ${topics.length} topics for: ${processedContent.title}`
      );

      res.status(200).json({
        success: true,
        topics,
        contentInfo: {
          title: processedContent.title,
          type: processedContent.type,
          wordCount: processedContent.wordCount || 0,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Custom prompt endpoint for re-extracting topics with user-provided instructions
app.post(
  "/api/extract-topics-custom",
  validateContent,
  async (req: express.Request, res: express.Response) => {
    try {
      const { customPrompt, ...contentData } = req.body;
      console.log(`Received custom extraction request for: ${contentData.url} (${contentData.type})`);
      
      if (!customPrompt || typeof customPrompt !== 'string' || customPrompt.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Custom prompt is required and must be a non-empty string',
        });
      }

      let processedContent: Content = contentData;

      // If it's a PDF, run it through the content extractor service first
      if (
        processedContent.type === "pdf" &&
        processedContent.text.includes("PDF_URL:")
      ) {
        console.log("PDF detected, processing with contentExtractor...");
        processedContent = await contentExtractor.processPDF(processedContent);
      }

      const topics = await topicExtractor.extractTopics(processedContent, customPrompt.trim());
      console.log(
        `Successfully extracted ${topics.length} topics with custom prompt for: ${processedContent.title}`
      );

      res.status(200).json({
        success: true,
        topics,
        customPromptUsed: customPrompt.trim(),
        contentInfo: {
          title: processedContent.title,
          type: processedContent.type,
          wordCount: processedContent.wordCount || 0,
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Batch processing endpoint
app.post("/api/batch-process", async (req: express.Request, res: express.Response) => {
  try {
    const { contents } = req.body as { contents: BatchContent[] };

    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body must contain a non-empty "contents" array.',
      });
    }

    console.log(`Processing batch of ${contents.length} items.`);
    const results: BatchResult[] = [];

    // Process items sequentially to avoid rate limits and high load
    for (const content of contents) {
      const result = await (async (): Promise<BatchResult> => {
        try {
          let processed = content;
          if (content.type === "pdf" && content.text.includes("PDF_URL:")) {
            processed = await contentExtractor.processPDF(content);
          }
          const topics = await topicExtractor.extractTopics(processed);
          return {
            url: content.url,
            success: true,
            topics,
            contentInfo: {
              title: processed.title,
              type: processed.type,
              wordCount: processed.wordCount || 0,
            },
          };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`Failed to process ${content.url} in batch:`, message);
          return { url: content.url, success: false, error: message };
        }
      })();
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(
      `Batch processing complete. Success: ${successCount}, Failed: ${
        results.length - successCount
      }`
    );

    res.status(200).json({
      success: true,
      results,
      summary: {
        total: contents.length,
        success: successCount,
        failed: results.length - successCount,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// --- Final Middleware (Error Handling & 404) ---

// Generic 404 handler for any other route
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Generic error handler, catches errors from synchronous parts of middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled application error:", err.stack);
  res.status(500).json({
    success: false,
    error: "An unexpected internal server error occurred.",
  });
});

// --- Server Activation ---

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `🔑 OpenAI API Key status: ${
      process.env.OPENAI_API_KEY ? "CONFIGURED" : "MISSING"
    }`
  );
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠️  Warning: OpenAI key not found. AI features will use fallback methods."
    );
  }
});
