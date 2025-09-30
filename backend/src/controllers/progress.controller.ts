import type { Request, Response } from 'express';
import UserTopicProgress from '../models/UserTopicProgress.js';
import UserFlashcardProgress from '../models/UserFlashcardProgress.js';
import Topic, { type ITopic } from '../models/Topic.js';
import { toFSRSCard, fromFSRSCard, scheduleReview, createNewCard } from '../services/fsrsService.js';
import { Rating } from 'ts-fsrs';
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

// Update flashcard progress with FSRS rating system
export const updateFlashcardProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }
    const { topicId, flashcardId } = req.params;
    const { rating } = req.body;

    // Validate rating (1-4)
    if (!rating || rating < 1 || rating > 4) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 4' });
      return;
    }

    // Find or create UserFlashcardProgress
    let userFlashcardProgress = await UserFlashcardProgress.findOne({ 
      user: userId, 
      flashcard: flashcardId 
    });

    if (!userFlashcardProgress) {
      // Create new card with FSRS defaults
      const newCard = createNewCard();
      const cardData = fromFSRSCard(newCard);
      
      userFlashcardProgress = new UserFlashcardProgress({
        user: userId,
        flashcard: flashcardId,
        topic: topicId,
        ...cardData
      });
    }

    // Convert to FSRS card and schedule review
    const fsrsCard = toFSRSCard(userFlashcardProgress);
    const reviewResult = scheduleReview(fsrsCard, rating as Rating);
    
    // Update progress with new FSRS data
    const updatedCardData = fromFSRSCard(reviewResult.card);
    Object.assign(userFlashcardProgress, updatedCardData);
    userFlashcardProgress.last_review = new Date();
    
    await userFlashcardProgress.save();

    // Update topic-level statistics
    await updateTopicStats(userId, topicId);

    res.json({ 
      success: true,
      nextReview: reviewResult.card.due,
      state: reviewResult.card.state,
      interval: reviewResult.card.scheduled_days
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Helper function to update topic-level statistics
const updateTopicStats = async (userId: string, topicId: string) => {
  try {
    // Get all flashcard progress for this user and topic
    const allProgress = await UserFlashcardProgress.find({ user: userId, topic: topicId });
    
    // Get topic to determine total flashcard count
    const topic = await Topic.findById(topicId);
    if (!topic) return;

    const total = topic.flashcards.length;
    const started = allProgress.length;
    const mastered = allProgress.filter(p => p.state >= 2).length; // Review or Relearning states
    const learning = allProgress.filter(p => p.state === 1).length; // Learning state
    const newCards = total - started;

    // Find or create UserTopicProgress
    let topicProgress = await UserTopicProgress.findOne({ user: userId, topic: topicId });
    if (!topicProgress) {
      topicProgress = new UserTopicProgress({ user: userId, topic: topicId });
    }

    // Update flashcard statistics
    topicProgress.flashcardStats = {
      total,
      started,
      mastered,
      learning,
      new: newCards
    };

    topicProgress.lastStudiedAt = new Date();

    // Set topicStartedAt if this is the first time studying
    if (!topicProgress.topicStartedAt && started > 0) {
      topicProgress.topicStartedAt = new Date();
    }

    // Set flashcardsMasteredAt if all flashcards are mastered
    if (!topicProgress.flashcardsMasteredAt && mastered === total && total > 0) {
      topicProgress.flashcardsMasteredAt = new Date();
    }

    await topicProgress.save();
  } catch (error) {
    console.error('Error updating topic stats:', error);
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

// Get due flashcards for a specific topic
export const getDueFlashcards = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }
    const { topicId } = req.params;

    // Get all due flashcards for this user and topic
    const dueProgress = await UserFlashcardProgress.find({
      user: userId,
      topic: topicId,
      due: { $lte: new Date() }
    }).populate('flashcard');

    // Get topic with all flashcards to determine new ones
    const topic = await Topic.findById(topicId).populate('flashcards');
    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found' });
      return;
    }

    // Get flashcards that haven't been started yet
    const startedFlashcardIds = dueProgress.map(p => p.flashcard.toString());
    const newFlashcards = topic.flashcards.filter(
      (flashcard: any) => !startedFlashcardIds.includes(flashcard._id.toString())
    );

    const dueFlashcards = dueProgress.map(p => p.flashcard);
    const totalDue = dueFlashcards.length + newFlashcards.length;

    res.json({
      success: true,
      dueFlashcards,
      newFlashcards,
      totalDue
    });
  } catch (error) {
    console.error('Error getting due flashcards:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get dashboard statistics for spaced repetition
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized, no user ID' });
      return;
    }

    // Count total due flashcards for today
    const dueTodayCount = await UserFlashcardProgress.countDocuments({
      user: userId,
      due: { $lte: new Date() }
    });

    // Get due count by topic
    const dueByTopicAggregation = await UserFlashcardProgress.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          due: { $lte: new Date() }
        }
      },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert aggregation result to a more usable format
    const dueByTopic = dueByTopicAggregation.reduce((acc: any, item: any) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      dueTodayCount,
      dueByTopic
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

