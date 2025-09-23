import { Router } from 'express';
import { getProgressForUser, createOrUpdateProgress } from '../controllers/progress.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// @route   GET /api/progress
// @desc    Get all progress for the authenticated user
// @access  Private
router.get('/', auth, getProgressForUser);

// @route   POST /api/progress
// @desc    Create or update a user's progress on a topic
// @access  Private
router.post('/', auth, createOrUpdateProgress);

export default router;
