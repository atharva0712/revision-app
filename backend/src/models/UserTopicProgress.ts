import { Schema, model, Document, Types } from 'mongoose';

export interface IUserTopicProgress extends Document {
  user: Types.ObjectId;
  topic: Types.ObjectId;
  completedFlashcards: Types.ObjectId[];
  assessmentAttempts: {
    score: number;
    completedQuestions: {
      question: Types.ObjectId;
      isCorrect: boolean;
    }[];
    attemptedAt: Date;
  }[];
  lastStudiedAt?: Date;
  masteryAchievedAt?: Date;
}

const UserTopicProgressSchema = new Schema<IUserTopicProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    completedFlashcards: [{ type: Schema.Types.ObjectId, ref: 'Flashcard' }],
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
    masteryAchievedAt: { type: Date },
  },
  { timestamps: true }
);

UserTopicProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

const UserTopicProgress = model<IUserTopicProgress>(
  'UserTopicProgress',
  UserTopicProgressSchema
);

export default UserTopicProgress;