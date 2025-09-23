import { Schema, model, Document, Types } from 'mongoose';

// Define the interface for the Topic document
export interface ITopic extends Document {
  user: Types.ObjectId;
  name: string;
  description?: string;
  status: 'processing' | 'success' | 'failed';
  sourceURL?: string;
  sourceTitle?: string;
  sourceType?: string;
  extractedAt?: Date;
  confidence?: number;
  category?: string;
  keywords?: string[];
  flashcards: Types.ObjectId[];
  assessment: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Topic schema
const TopicSchema = new Schema<ITopic>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['processing', 'success', 'failed'],
    required: true,
  },
  sourceURL: {
    type: String,
  },
  sourceTitle: {
    type: String,
  },
  sourceType: {
    type: String,
  },
  extractedAt: {
    type: Date,
  },
  confidence: {
    type: Number,
  },
  category: {
    type: String,
  },
  keywords: {
    type: [String],
  },
  flashcards: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Flashcard',
    },
  ],
  assessment: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
  ],
},
{
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Topic = model<ITopic>('Topic', TopicSchema);

export default Topic;
