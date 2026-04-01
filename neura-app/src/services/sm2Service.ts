/**
 * SM-2 spaced repetition algorithm — on-device mirror of the backend logic.
 * Used for offline flashcard reviews (T-12-04).
 */

export type ReviewQuality = 0 | 3 | 5;

export interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // ISO date YYYY-MM-DD
}

/**
 * Calculate next review schedule using SM-2.
 * @param quality  0 = forgot, 3 = hard, 5 = easy
 */
export function calculateSM2(
  quality: ReviewQuality,
  easeFactor: number,
  intervalDays: number,
  repetitions: number
): SM2Result {
  let newEF = easeFactor;
  let newInterval = intervalDays;
  let newReps = repetitions;

  if (quality >= 3) {
    // Correct response
    if (newReps === 0) {
      newInterval = 1;
    } else if (newReps === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEF);
    }
    newReps += 1;
    newEF = newEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 1.3) newEF = 1.3;
  } else {
    // Incorrect — reset
    newReps = 0;
    newInterval = 1;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);
  const nextReviewDate = nextDate.toISOString().split("T")[0];

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    intervalDays: newInterval,
    repetitions: newReps,
    nextReviewDate,
  };
}
