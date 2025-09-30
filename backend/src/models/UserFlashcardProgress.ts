import { Schema, model, Document, Types } from 'mongoose';

export interface IUserFlashcardProgress extends Document {
  user: Types.ObjectId;
  flashcard: Types.ObjectId;
  topic: Types.ObjectId;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps: number;
  state: number; // 0: New, 1: Learning, 2: Review, 3: Relearning
  last_review?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserFlashcardProgressSchema = new Schema<IUserFlashcardProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    flashcard: { type: Schema.Types.ObjectId, ref: 'Flashcard', required: true },
    topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    due: { type: Date, required: true },
    stability: { type: Number, required: true },
    difficulty: { type: Number, required: true },
    elapsed_days: { type: Number, required: true },
    scheduled_days: { type: Number, required: true },
    reps: { type: Number, required: true },
    lapses: { type: Number, required: true },
    learning_steps: { type: Number, required: true },
    state: {
      type: Number, 
      required: true,
      enum: [0, 1, 2, 3] // New, Learning, Review, Relearning
    },
    last_review: { type: Date }
  },
  { timestamps: true }
);

// Indexes for efficient queries
UserFlashcardProgressSchema.index({ user: 1, flashcard: 1 }, { unique: true });
UserFlashcardProgressSchema.index({ user: 1, due: 1 });
UserFlashcardProgressSchema.index({ user: 1, topic: 1, due: 1 });

const UserFlashcardProgress = model<IUserFlashcardProgress>(
  'UserFlashcardProgress',
  UserFlashcardProgressSchema
);

export default UserFlashcardProgress;