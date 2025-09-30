import { Types } from 'mongoose';
import type { ITopic } from '../models/Topic.js';

export const buildDiagnosticPrompt = (topic: ITopic): string => {
  const topicName = String(topic.name || '');
  const topicDescription = String(topic.description || 'No description provided.');

  return `You are an expert educational diagnostician. Your task is to create a deep diagnostic assessment for the user on the following topic. The goal is to test their knowledge from foundational concepts to advanced applications, helping them identify and remedy knowledge gaps.

TOPIC DETAILS:
Title: ${topicName}
Description: ${topicDescription}

INSTRUCTIONS:
1.  **Generate 10-15 Questions:** Create a set of 10 to 15 multiple-choice questions.
2.  **Tiered Difficulty:** The questions must be ordered by difficulty, starting with the easiest and progressing to the most challenging.
    *   **Easy (First ~4 questions):** Focus on basic definitions, key terms, and fundamental concepts.
    *   **Medium (Next ~6 questions):** Focus on application of concepts, simple scenarios, and comparing/contrasting key ideas.
    *   **Hard (Final ~5 questions):** Focus on complex scenarios, analysis, synthesis of multiple concepts, and problem-solving.
3.  **Detailed Explanations:** For EACH question, provide a highly detailed 'explanation'. This is the most important part. The explanation should not just state the right answer, but comprehensively explain the underlying concepts, why the correct answer is right, and why the other options are incorrect. It should be a mini-lesson.
4.  **Multiple Choice:** Each question must have 4 options, with only one correct answer.

RESPONSE FORMAT:
Provide your response as a single JSON object with one top-level key: 'diagnosticQuestions'.

'''json
{
  "diagnosticQuestions": [
    {
      "questionText": "[Easy Question 1]",
      "options": ["[Option A]", "[Option B]", "[Option C]", "[Option D]"],
      "correctAnswer": "[Correct Option]",
      "explanation": "[VERY DETAILED explanation of the concept, the correct answer, and why other options are wrong.]"
    },
    {
      "questionText": "[Easy Question 2]",
      "options": ["[Option A]", "[Option B]", "[Option C]", "[Option D]"],
      "correctAnswer": "[Correct Option]",
      "explanation": "[VERY DETAILED explanation...]"
    }
  ]
}
'''

Ensure the JSON is valid and strictly follows this structure. The quality and detail of the explanations are critical.`;
};

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
