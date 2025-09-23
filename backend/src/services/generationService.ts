import { Types } from 'mongoose';
import OpenAI from 'openai';
import Flashcard, { type IFlashcard } from '../models/Flashcard.js';
import Question, { type IQuestion } from '../models/Question.js';
import Topic, { type ITopic } from '../models/Topic.js';
import { buildGenerationPrompt } from '../prompts/generationPrompts.js';

// Define the expected structure of the AI's response
interface AIGenerationResponse {
  flashcards: Array<Omit<IFlashcard, '_id' | 'topic' | 'createdAt' | 'updatedAt'>>;
  assessmentQuestions: Array<Omit<IQuestion, '_id' | 'topic' | 'createdAt' | 'updatedAt'>>;
}

class GenerationService {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI lazily
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured. Cannot generate content.');
      }
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  public async generateContent(topic: ITopic): Promise<void> {
    try {
      const openai = this.getOpenAI();
      const prompt = buildGenerationPrompt(topic);

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Or gpt-4, depending on desired quality/cost
        messages: [
          { role: 'system', content: 'You are an expert educational content creator. Generate flashcards and assessment questions based on the provided topic.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000, // Adjust based on expected output length
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const messageContent = response.choices[0]?.message?.content;
      if (!messageContent) {
        throw new Error('OpenAI returned empty response for content generation.');
      }

      const aiResponse = JSON.parse(messageContent) as AIGenerationResponse;

      // Save Flashcards
      const savedFlashcards = await Promise.all(
        aiResponse.flashcards.map(async (fcData) => {
          const flashcard = new Flashcard({ ...fcData, topic: topic._id });
          return flashcard.save();
        })
      );

      // Save Questions
      const savedQuestions = await Promise.all(
        aiResponse.assessmentQuestions.map(async (qData) => {
          const question = new Question({ ...qData, topic: topic._id });
          return question.save();
        })
      );

      // Update Topic with references and status
      topic.flashcards = savedFlashcards.map((fc) => fc._id) as Types.ObjectId[];
      topic.assessment = savedQuestions.map((q) => q._id) as Types.ObjectId[];
      topic.status = 'success';
      await topic.save();
    } catch (error: any) {
      topic.status = 'failed';
      await topic.save();
    }
  }
}

export const generationService = new GenerationService();
