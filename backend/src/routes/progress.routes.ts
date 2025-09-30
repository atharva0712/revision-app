import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getAllUserProgress,
  updateFlashcardProgress,
  submitAssessment,
  updateGeneralProgress,
  getDueFlashcards,
  getDashboardStats,
} from '../controllers/progress.controller.js';

const router = Router();

router.get('/', auth, getAllUserProgress);
router.post('/:topicId/flashcard/:flashcardId', auth, updateFlashcardProgress);
router.get('/:topicId/flashcards/due', auth, getDueFlashcards);
router.get('/dashboard', auth, getDashboardStats);
router.post('/assessment', auth, submitAssessment);
router.post('/:topicId', auth, updateGeneralProgress);

export default router;