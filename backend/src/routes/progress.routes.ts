import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getAllUserProgress,
  updateFlashcardProgress,
  submitAssessment,
  updateGeneralProgress,
} from '../controllers/progress.controller.js';

const router = Router();

router.get('/', auth, getAllUserProgress);
router.post('/flashcard', auth, updateFlashcardProgress);
router.post('/assessment', auth, submitAssessment);
router.post('/:topicId', auth, updateGeneralProgress);

export default router;