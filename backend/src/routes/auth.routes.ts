import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get user data from token
// @access  Private
router.get('/me', auth, getMe);

export default router;
