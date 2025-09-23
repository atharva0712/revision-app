import type { Request, Response } from 'express';
import UserTopicProgress from '../models/UserTopicProgress.js';

// @route   GET /api/progress
// @desc    Get all progress for the authenticated user
// @access  Private
export const getProgressForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const progress = await UserTopicProgress.find({ user: req.user.id });
    res.status(200).json({ success: true, progress });
  } catch (err: any) {
    console.error('Error fetching user progress:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/progress
// @desc    Create or update a user's progress on a topic
// @access  Private
export const createOrUpdateProgress = async (req: Request, res: Response): Promise<void> => {
  const { topicId, assessmentScore, flashcardsCompleted } = req.body;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const updateData: any = {
      user: req.user.id,
      topic: topicId,
      lastAttempted: new Date(),
    };

    if (assessmentScore !== undefined) {
      updateData.assessmentScore = assessmentScore;
    }

    if (flashcardsCompleted) {
      updateData.flashcardsCompletedAt = new Date();
    }

    const progress = await UserTopicProgress.findOneAndUpdate(
      { user: req.user.id, topic: topicId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, progress });

  } catch (err: any) {
    console.error('Error updating progress:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
