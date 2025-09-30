import type { Request, Response } from 'express';
import type { ITopic } from '../models/Topic.js';
import Topic from '../models/Topic.js';
import { generationService } from '../services/generationService.js';

// Extend the Request interface to include the user property from auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// @route   POST /api/topics
// @desc    Save a new topic and trigger asynchronous content generation
// @access  Private
export const createTopic = async (req: Request, res: Response): Promise<void> => {
  const { name, description, sourceURL, sourceTitle, sourceType, extractedAt, confidence, category, keywords } = req.body;

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    // Create new topic instance
    const newTopic: ITopic = new Topic({
      user: req.user.id,
      name,
      description,
      status: 'processing', // Set initial status to processing
      sourceURL,
      sourceTitle,
      sourceType,
      extractedAt: extractedAt ? new Date(extractedAt) : undefined,
      confidence,
      category,
      keywords,
      flashcards: [], // Initialize as empty arrays
      assessment: [],
    });

    // Save topic to database
    await newTopic.save();

    // Respond immediately to the client
    res.status(202).json({ success: true, message: 'Topic received and content generation started.', topic: newTopic });

    // Asynchronously trigger content generation
    // We don't await this so the API call returns quickly
    generationService.generateContent(newTopic);

  } catch (err: any) {
    console.error('Error creating topic:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/topics
// @desc    Get all topics for the authenticated user
// @access  Private
export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    const topics = await Topic.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, topics });
  } catch (err: any) {
    console.error('Error fetching topics:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/topics/:id
// @desc    Get a single topic by ID for the authenticated user
// @access  Private
export const getTopicById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    const topic = await Topic.findOne({ _id: req.params.id, user: req.user.id })
      .populate('flashcards')
      .populate('assessment');

    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found' });
      return;
    }

    res.status(200).json({ success: true, topic });
  } catch (err: any) {
    console.error('Error fetching topic by ID:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/topics/:id/retry
// @desc    Retry content generation for a failed topic
// @access  Private
export const retryTopicGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    const topic = await Topic.findOne({ _id: req.params.id, user: req.user.id });

    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found' });
      return;
    }

    // Only allow retry if status is 'failed'
    if (topic.status !== 'failed') {
      res.status(400).json({ success: false, message: 'Content generation can only be retried for failed topics.' });
      return;
    }

    // Reset status to processing and trigger generation again
    topic.status = 'processing';
    topic.flashcards = []; // Clear previous attempts
    topic.assessment = [];
    await topic.save();

    // Respond immediately
    res.status(202).json({ success: true, message: 'Content generation retry initiated.', topic });

    // Asynchronously trigger content generation
    generationService.generateContent(topic);

  } catch (err: any) {
    console.error('Error retrying topic generation:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/topics/:id/deep-diagnostic
// @desc    Generate a deep diagnostic assessment for a topic
// @access  Private
export const generateDeepDiagnostic = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    const topic = await Topic.findOne({ _id: req.params.id, user: req.user.id });

    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found' });
      return;
    }

    // Call the generation service to get diagnostic questions
    const diagnosticQuestions = await generationService.generateDiagnosticQuestions(topic);

    res.status(200).json({ success: true, questions: diagnosticQuestions });

  } catch (err: any) {
    console.error('Error generating deep diagnostic assessment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
