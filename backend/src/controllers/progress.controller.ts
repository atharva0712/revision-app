import type { Request, Response } from 'express';
import UserTopicProgress from '../models/UserTopicProgress.js';
import Topic, { type ITopic } from '../models/Topic.js';
import { Types } from 'mongoose';

// Helper function to get or create a progress document
const getOrCreateProgress = async (userId: string, topicId: string) => {
  let progress = await UserTopicProgress.findOne({ user: userId, topic: topicId });
  if (!progress) {
    progress = new UserTopicProgress({ user: userId, topic: topicId });
    await progress.save();
  }
  return progress;
};

// Calculate progress for a single topic
export const getTopicProgress = async (userId: string, topicId: string) => {
  const progress = await UserTopicProgress.findOne({ user: userId, topic: topicId });
  const topic: ITopic | null = await Topic.findById(topicId).populate('flashcards').populate('assessment');

  if (!topic) {
    return { topicId, progress: 0 };
  }

  if (!progress) {
    return { topicId, progress: 0 };
  }

  if (progress.masteryAchievedAt) {
    return { topicId, progress: 100 };
  }

  let calculatedProgress = 0;
  if (progress.flashcardsCompleted) {
    calculatedProgress += 50;
  }
  if (progress.assessmentCompleted) {
    calculatedProgress += 50;
  }

  return { topicId, progress: calculatedProgress };
};

// Get progress for all topics for a user
export const getAllUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Use optional chaining as req.user might be undefined
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    const topics = await Topic.find({ user: userId });
    const progressPromises = topics.map((topic: ITopic) => getTopicProgress(userId, (topic._id as Types.ObjectId).toString()));
    const progresses = await Promise.all(progressPromises);

    const progressMap = progresses.reduce((acc: { [topicId: string]: number }, p: { topicId: string; progress: number }) => {
      acc[p.topicId] = p.progress;
      return acc;
    }, {} as { [topicId: string]: number });

    res.json({ success: true, progress: progressMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update flashcard progress
export const updateFlashcardProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }
    const { topicId, flashcardId } = req.body;

    const progress = await getOrCreateProgress(userId, topicId);

    if (!progress.completedFlashcards.includes(flashcardId)) {
      progress.completedFlashcards.push(flashcardId);
      progress.lastStudiedAt = new Date();
      await progress.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Submit an assessment attempt
export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }
    const { topicId, completedQuestions } = req.body;

    const progress = await getOrCreateProgress(userId, topicId);
    const topic: ITopic | null = await Topic.findById(topicId).populate('assessment');

    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    const score = completedQuestions.filter((q: any) => q.isCorrect).length;

    progress.assessmentAttempts.push({ 
      score, 
      completedQuestions, 
      attemptedAt: new Date() 
    });

    // Check for mastery
    const { progress: totalProgress } = await getTopicProgress(userId, topicId);
    if (totalProgress >= 100 && !progress.masteryAchievedAt) {
      progress.masteryAchievedAt = new Date();
    }

    await progress.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @route   POST /api/progress/:topicId
// @desc    Update general progress flags for a topic (e.g., flashcardsCompleted)
// @access  Private
export const updateGeneralProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }
    const { topicId } = req.params;
    if (!topicId) {
      res.status(400).json({ success: false, message: 'Topic ID is required.' });
      return;
    }
    const { flashcardsCompleted, assessmentCompleted } = req.body;

    const progress = await getOrCreateProgress(userId, topicId as string);

    if (typeof flashcardsCompleted === 'boolean') {
      progress.flashcardsCompleted = flashcardsCompleted;
    }
    if (typeof assessmentCompleted === 'boolean') {
      progress.assessmentCompleted = assessmentCompleted;
    }
    progress.lastStudiedAt = new Date();

    // Re-calculate overall progress and check for mastery
    const { progress: totalProgress } = await getTopicProgress(userId, topicId as string);
    if (totalProgress >= 100 && !progress.masteryAchievedAt) {
      progress.masteryAchievedAt = new Date();
    }

    await progress.save();

    res.status(200).json({ success: true, message: 'Progress updated successfully.' });

  } catch (error) {
    console.error('Error updating general progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};