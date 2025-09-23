import { Router } from 'express';
import { createTopic, getTopics, getTopicById, retryTopicGeneration } from '../controllers/topic.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// @route   POST /api/topics
// @desc    Create a new topic and trigger content generation
// @access  Private
router.post('/', auth, createTopic);

// @route   GET /api/topics
// @desc    Get all topics for the authenticated user
// @access  Private
router.get('/', auth, getTopics);

// @route   GET /api/topics/:id
// @desc    Get a single topic by ID for the authenticated user
// @access  Private
router.get('/:id', auth, getTopicById);

// @route   POST /api/topics/:id/retry
// @desc    Retry content generation for a failed topic
// @access  Private
router.post('/:id/retry', auth, retryTopicGeneration);

export default router;
