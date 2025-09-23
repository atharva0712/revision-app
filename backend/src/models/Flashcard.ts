import { Schema, model, Document, Types } from 'mongoose';

// Interface for the MCQs within a flashcard
interface IMcq {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Define the interface for the Flashcard document
export interface IFlashcard extends Document {
  topic: Types.ObjectId;
  sequence?: number;
  front: string;
  back: string;
  mcqs?: IMcq[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Flashcard schema
const FlashcardSchema = new Schema<IFlashcard>({
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  sequence: {
    type: Number,
  },
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  mcqs: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: String, required: true },
    },
  ],
},
{
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Flashcard = model<IFlashcard>('Flashcard', FlashcardSchema);

export default Flashcard;
