import { Router } from 'express';
import auth from '../middleware/auth';
import {
  getAllUserProgress,
  updateFlashcardProgress,
  submitAssessment,
} from '../controllers/progress.controller';

const router = Router();

router.get('/', auth, getAllUserProgress);
router.post('/flashcard', auth, updateFlashcardProgress);
router.post('/assessment', auth, submitAssessment);

export default router;