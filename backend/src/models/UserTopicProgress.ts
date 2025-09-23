import { Schema, model, Document, Types } from 'mongoose';

export interface IUserTopicProgress extends Document {
  user: Types.ObjectId;
  topic: Types.ObjectId;
  lastAttempted?: Date;
  assessmentScore?: number;
  flashcardsCompletedAt?: Date;
}

const UserTopicProgressSchema = new Schema<IUserTopicProgress>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  lastAttempted: { type: Date },
  assessmentScore: { type: Number },
  flashcardsCompletedAt: { type: Date },
}, { timestamps: true });

// Ensure a user can only have one progress entry per topic
UserTopicProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

const UserTopicProgress = model<IUserTopicProgress>('UserTopicProgress', UserTopicProgressSchema);

export default UserTopicProgress;
