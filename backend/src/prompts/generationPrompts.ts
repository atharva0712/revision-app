import { Types } from 'mongoose';
import type { ITopic } from '../models/Topic.js';

export const buildGenerationPrompt = (topic: ITopic): string => {
  // Ensure we're working with primitive values, not String objects
  const topicName = String(topic.name || '');
  const topicDescription = String(topic.description || 'No description provided.');
  const sourceURL = String(topic.sourceURL || 'N/A');
  const sourceType = String(topic.sourceType || 'N/A');
  const keywords = Array.isArray(topic.keywords) 
    ? topic.keywords.map((k: string) => String(k)).join(', ') 
    : 'None';

  return `You are an expert educational content creator. Your task is to generate a set of flashcards and a 10-question multiple-choice assessment based on the following learning topic.

TOPIC DETAILS:
Title: ${topicName}
Description: ${topicDescription}
Source URL: ${sourceURL}
Source Type: ${sourceType}
Keywords: ${keywords}

INSTRUCTIONS:
1.  **Flashcards (5-7 cards):**
    *   Each flashcard should have a 'front' (question/term) and a 'back' (answer/definition).
    *   For each flashcard, generate 2-3 multiple-choice questions (MCQs) that directly test the knowledge presented on that specific flashcard. These MCQs should have 4 options, with one correct answer.
    *   Ensure the flashcards cover key concepts and facts from the topic.
2.  **Assessment Questions (10 questions):**
    *   Generate 10 distinct multiple-choice questions that cover the broader topic comprehensively.
    *   Each question should have 4 options, with one correct answer.
    *   Include a brief 'explanation' for why the correct answer is correct (and why others are wrong, if applicable).

RESPONSE FORMAT:
Provide your response as a single JSON object with two top-level keys: 'flashcards' and 'assessmentQuestions'.

'''json
{
  "flashcards": [
    {
      "front": "[Flashcard Question/Term]",
      "back": "[Flashcard Answer/Definition]",
      "mcqs": [
        {
          "question": "[MCQ Question 1]",
          "options": ["[Option A]", "[Option B]", "[Option C]", "[Option D]"],
          "correctAnswer": "[Correct Option]"
        }
      ]
    }
  ],
  "assessmentQuestions": [
    {
      "questionText": "[Assessment Question 1]",
      "options": ["[Option A]", "[Option B]", "[Option C]", "[Option D]"],
      "correctAnswer": "[Correct Option]",
      "explanation": "[Brief explanation for the correct answer]"
    }
  ]
}
'''

Ensure the JSON is valid and strictly follows this structure. The content should be educational and directly relevant to the topic details provided.`;
}; 
