import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Create new user instance
    user = new User({ name, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/auth/me
// @desc    Get user data from token
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // The auth middleware has already attached the user id
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });

  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};// Authenticate user & get token (Login)
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid Credentials' });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Invalid Credentials' });
      return;
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
