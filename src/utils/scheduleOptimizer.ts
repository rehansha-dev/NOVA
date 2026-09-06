import type { Event } from "../data/events";
import type { ScheduleEvent } from "./clashDetection";
import { getPersonalizationScore } from "./personalization";

export interface OptimizerResult {
  recommendedEvent: ScheduleEvent;
  alternativeEvent: ScheduleEvent;
  recommendedScore: number;
  alternativeScore: number;
  reason: string;
}

function convertToMinutes(time: string) {
  const [timePart, modifier] = time.split(" ");

  let [hours, minutes] = timePart
    .split(":")
    .map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function getDuration(event: ScheduleEvent) {
  const start = convertToMinutes(event.startTime);
  const end = convertToMinutes(event.endTime);

  return end >= start
    ? end - start
    : end + 1440 - start;
}

function calculateScore(event: ScheduleEvent) {
  let score = 0;

  // Duration
  const duration = getDuration(event);

  if (duration >= 180) {
    score += 25;
  } else if (duration >= 120) {
    score += 20;
  } else if (duration >= 60) {
    score += 12;
  } else {
    score += 5;
  }

  // Popularity
  const attendance =
    "attendees" in event
      ? Number(
          (event as ScheduleEvent & {
            attendees?: number;
          }).attendees || 0
        )
      : 0;

  if (attendance >= 250) {
    score += 20;
  } else if (attendance >= 150) {
    score += 15;
  } else if (attendance >= 75) {
    score += 10;
  } else {
    score += 5;
  }

  // General relevance
  if (
    "category" in event &&
    (event as Event).category === "Technology"
  ) {
    score += 10;
  } else if (
    "category" in event &&
    (event as Event).category === "Business"
  ) {
    score += 10;
  }

  // Personalization
  if ("category" in event) {
    score += getPersonalizationScore(event as Event);
  }

  return score;
}

export function optimizeClash(
  firstEvent: ScheduleEvent,
  secondEvent: ScheduleEvent
): OptimizerResult {
  const firstScore = calculateScore(firstEvent);
  const secondScore = calculateScore(secondEvent);

  if (firstScore >= secondScore) {
    return {
      recommendedEvent: firstEvent,
      alternativeEvent: secondEvent,
      recommendedScore: firstScore,
      alternativeScore: secondScore,
      reason:
        "NOVA considered event duration, popularity, relevance, and your previous event preferences.",
    };
  }

  return {
    recommendedEvent: secondEvent,
    alternativeEvent: firstEvent,
    recommendedScore: secondScore,
    alternativeScore: firstScore,
    reason:
      "NOVA considered event duration, popularity, relevance, and your previous event preferences.",
  };
}