import { fsrs, generatorParameters, Rating, State, createEmptyCard } from 'ts-fsrs';

// Initialize FSRS parameters with custom settings
const params = generatorParameters({ 
  enable_fuzz: true, 
  maximum_interval: 365, 
  request_retention: 0.9, 
  enable_short_term: false 
});

// Initialize FSRS instance
const f = fsrs(params);

// Type definitions based on the actual API
type Card = ReturnType<typeof createEmptyCard>;
type ReviewResult = ReturnType<typeof f.next>;

/**
 * Converts a UserFlashcardProgress document to an FSRS Card
 */
export function toFSRSCard(progress: any): Card {
  return {
    due: progress.due,
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: progress.elapsed_days,
    scheduled_days: progress.scheduled_days,
    reps: progress.reps,
    lapses: progress.lapses,
    learning_steps: progress.learning_steps || 0,
    state: progress.state as State,
    last_review: progress.last_review
  };
}

/**
 * Converts an FSRS Card to a format suitable for storing in MongoDB
 */
export function fromFSRSCard(card: Card) {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    learning_steps: card.learning_steps,
    state: card.state,
    last_review: card.last_review
  };
}

/**
 * Schedules the next review for a card based on the user's rating
 */
export function scheduleReview(currentCard: Card, rating: Rating, reviewDate: Date = new Date()): ReviewResult {
  return f.next(currentCard, reviewDate, rating);
}

/**
 * Creates a new empty FSRS card for a flashcard that hasn't been studied yet
 */
export function createNewCard(): Card {
  return createEmptyCard();
}