import { getCurrentUser } from "./auth";

export interface Feedback {
  id: string;
  userId: string;
  eventId: number;
  rating: number;
  organizationRating: number;
  contentRating: number;
  venueRating: number;
  comment: string;
  wouldAttendAgain: boolean;
  createdAt: string;
  updatedAt: string;
}

const FEEDBACK_STORAGE_KEY = "nova-feedback";

function getAllFeedback(): Feedback[] {
  const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Feedback[];
  } catch {
    return [];
  }
}

function saveAllFeedback(feedback: Feedback[]): void {
  localStorage.setItem(
    FEEDBACK_STORAGE_KEY,
    JSON.stringify(feedback)
  );
}

function isValidRating(rating: number): boolean {
  return (
    Number.isFinite(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

/**
 * Get feedback submitted by the current user
 * for a specific event.
 */
export function getUserFeedback(
  eventId: number
): Feedback | null {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const feedback = getAllFeedback();

  return (
    feedback.find(
      (item) =>
        item.userId === currentUser.id &&
        item.eventId === eventId
    ) ?? null
  );
}

/**
 * Check whether the current user has submitted
 * feedback for an event.
 */
export function hasSubmittedFeedback(
  eventId: number
): boolean {
  return getUserFeedback(eventId) !== null;
}

/**
 * Create or update feedback.
 */
export function saveFeedback(
  eventId: number,
  data: {
    rating: number;
    organizationRating: number;
    contentRating: number;
    venueRating: number;
    comment: string;
    wouldAttendAgain: boolean;
  }
): boolean {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return false;
  }

  // Validate all ratings.
  if (
    !isValidRating(data.rating) ||
    !isValidRating(data.organizationRating) ||
    !isValidRating(data.contentRating) ||
    !isValidRating(data.venueRating)
  ) {
    return false;
  }

  const feedback = getAllFeedback();

  const existingIndex = feedback.findIndex(
    (item) =>
      item.userId === currentUser.id &&
      item.eventId === eventId
  );

  const now = new Date().toISOString();

  // Update existing feedback.
  if (existingIndex !== -1) {
    feedback[existingIndex] = {
      ...feedback[existingIndex],
      rating: data.rating,
      organizationRating: data.organizationRating,
      contentRating: data.contentRating,
      venueRating: data.venueRating,
      comment: data.comment.trim(),
      wouldAttendAgain: data.wouldAttendAgain,
      updatedAt: now,
    };

    saveAllFeedback(feedback);

    return true;
  }

  // Create new feedback.
  const newFeedback: Feedback = {
    id: `${currentUser.id}-${eventId}-${Date.now()}`,
    userId: currentUser.id,
    eventId,
    rating: data.rating,
    organizationRating: data.organizationRating,
    contentRating: data.contentRating,
    venueRating: data.venueRating,
    comment: data.comment.trim(),
    wouldAttendAgain: data.wouldAttendAgain,
    createdAt: now,
    updatedAt: now,
  };

  saveAllFeedback([
    ...feedback,
    newFeedback,
  ]);

  return true;
}

/**
 * Delete the current user's feedback.
 */
export function deleteFeedback(
  eventId: number
): boolean {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return false;
  }

  const feedback = getAllFeedback();

  const updatedFeedback = feedback.filter(
    (item) =>
      !(
        item.userId === currentUser.id &&
        item.eventId === eventId
      )
  );

  saveAllFeedback(updatedFeedback);

  return true;
}

/**
 * Get all feedback for an event.
 */
export function getEventFeedback(
  eventId: number
): Feedback[] {
  return getAllFeedback().filter(
    (item) => item.eventId === eventId
  );
}

/**
 * Get average overall rating.
 */
export function getEventAverageRating(
  eventId: number
): number {
  const feedback = getEventFeedback(eventId);

  if (feedback.length === 0) {
    return 0;
  }

  const total = feedback.reduce(
    (sum, item) => sum + item.rating,
    0
  );

  return Number(
    (total / feedback.length).toFixed(1)
  );
}

/**
 * Get rating distribution.
 */
export function getEventRatingDistribution(
  eventId: number
): Record<number, number> {
  const feedback = getEventFeedback(eventId);

  const distribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  feedback.forEach((item) => {
    if (
      Number.isInteger(item.rating) &&
      item.rating >= 1 &&
      item.rating <= 5
    ) {
      distribution[item.rating]++;
    }
  });

  return distribution;
}

/**
 * Get percentage of students who
 * would attend the event again.
 */
export function getWouldAttendAgainPercentage(
  eventId: number
): number {
  const feedback = getEventFeedback(eventId);

  if (feedback.length === 0) {
    return 0;
  }

  const yesCount = feedback.filter(
    (item) => item.wouldAttendAgain
  ).length;

  return Math.round(
    (yesCount / feedback.length) * 100
  );
}

/**
 * Get total feedback responses.
 */
export function getEventFeedbackCount(
  eventId: number
): number {
  return getEventFeedback(eventId).length;
}