import type { Event } from "../data/events";
import { getPersonalizationScore } from "./personalization";

export interface EventRecommendation {
  event: Event;
  score: number;
  reason: string;
}

function getEventScore(event: Event): number {
  let score = 0;

  // Personalization
  score += getPersonalizationScore(event);

  // Popularity
  if (event.attendees >= 250) {
    score += 20;
  } else if (event.attendees >= 150) {
    score += 15;
  } else if (event.attendees >= 75) {
    score += 10;
  } else {
    score += 5;
  }

  // Category relevance
  if (
    event.category === "Technology" ||
    event.category === "Business"
  ) {
    score += 5;
  }

  return score;
}

function getRecommendationReason(event: Event): string {
  const personalizationScore =
    getPersonalizationScore(event);

  if (personalizationScore >= 15) {
    return `Matches your interest in ${event.category}.`;
  }

  if (personalizationScore > 0) {
    return `You've shown interest in ${event.category} events.`;
  }

  if (event.attendees >= 250) {
    return "A highly popular event on campus.";
  }

  if (
    event.category === "Technology" ||
    event.category === "Business"
  ) {
    return `A strong ${event.category.toLowerCase()} pick for campus life.`;
  }

  return "A new event worth exploring.";
}

export function getRecommendedEvents(
  events: Event[],
  limit = 3
): EventRecommendation[] {
  if (events.length === 0) {
    return [];
  }

  return [...events]
    .map((event) => ({
      event,
      score: getEventScore(event),
      reason: getRecommendationReason(event),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.event.attendees - a.event.attendees;
    })
    .slice(0, limit);
}
