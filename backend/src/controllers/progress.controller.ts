import type { Request, Response } from 'express';
import UserTopicProgress from '../models/UserTopicProgress';
import Topic from '../models/Topic';

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
  const topic = await Topic.findById(topicId).populate('flashcards').populate('assessment');

  if (!topic) {
    return { topicId, progress: 0 };
  }

  if (!progress) {
    return { topicId, progress: 0 };
  }

  if (progress.masteryAchievedAt) {
    return { topicId, progress: 100 };
  }

  const flashcardProgress = (progress.completedFlashcards.length / topic.flashcards.length) * 50;
  
  let assessmentProgress = 0;
  if (progress.assessmentAttempts.length > 0) {
    assessmentProgress = 50;
  }

  return { topicId, progress: Math.round(flashcardProgress + assessmentProgress) };
};

// Get progress for all topics for a user
export const getAllUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const topics = await Topic.find({ user: userId });
    const progressPromises = topics.map(topic => getTopicProgress(userId, topic._id.toString()));
    const progresses = await Promise.all(progressPromises);

    const progressMap = progresses.reduce((acc, p) => {
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
    const userId = (req as any).user.id;
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
    const userId = (req as any).user.id;
    const { topicId, completedQuestions } = req.body;

    const progress = await getOrCreateProgress(userId, topicId);
    const topic = await Topic.findById(topicId).populate('assessment');

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