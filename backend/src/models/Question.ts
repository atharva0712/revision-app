import { Schema, model, Document, Types } from 'mongoose';

// Define the interface for the Question document
export interface IQuestion extends Document {
  topic: Types.ObjectId;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Question schema
const QuestionSchema = new Schema<IQuestion>({
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
},
{
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Question = model<IQuestion>('Question', QuestionSchema);

export default Question;
