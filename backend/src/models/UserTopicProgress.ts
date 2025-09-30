import { Schema, model, Document, Types } from 'mongoose';

export interface IUserTopicProgress extends Document {
  user: Types.ObjectId;
  topic: Types.ObjectId;
  flashcardStats: {
    total: number;
    started: number;
    mastered: number;
    learning: number;
    new: number;
  };
  assessmentAttempts: {
    score: number;
    completedQuestions: {
      question: Types.ObjectId;
      isCorrect: boolean;
    }[];
    attemptedAt: Date;
  }[];
  lastStudiedAt?: Date;
  topicStartedAt?: Date;
  flashcardsMasteredAt?: Date;
  assessmentPassed: boolean;
  topicCompleted: boolean;
  masteryAchievedAt?: Date;
  flashcardsCompleted?: boolean;
  assessmentCompleted?: boolean;
}

const UserTopicProgressSchema = new Schema<IUserTopicProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    flashcardStats: {
      total: { type: Number, default: 0 },
      started: { type: Number, default: 0 },
      mastered: { type: Number, default: 0 },
      learning: { type: Number, default: 0 },
      new: { type: Number, default: 0 }
    },
    assessmentAttempts: [
      {
        score: { type: Number, required: true },
        completedQuestions: [
          {
            question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
    lastStudiedAt: { type: Date },
    topicStartedAt: { type: Date },
    flashcardsMasteredAt: { type: Date },
    assessmentPassed: { type: Boolean, default: false },
    topicCompleted: { type: Boolean, default: false },
    masteryAchievedAt: { type: Date },
    flashcardsCompleted: { type: Boolean, default: false },
    assessmentCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserTopicProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

const UserTopicProgress = model<IUserTopicProgress>(
  'UserTopicProgress',
  UserTopicProgressSchema
);

export default UserTopicProgress;