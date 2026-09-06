import type { Event } from "../data/events";
import { getPersonalizationScore } from "./personalization";

export interface SmartScheduleResult {
  selectedEvents: Event[];
  skippedEvents: Event[];
  score: number;
  conflictsResolved: number;
  reason: string;
}

function convertToMinutes(time: string) {
  const [timePart, modifier] = time.split(" ");

  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function getEventScore(event: Event) {
  let score = 0;

  const start = convertToMinutes(event.startTime);
  const end = convertToMinutes(event.endTime);

  const duration =
    end >= start
      ? end - start
      : end + 1440 - start;

  // Duration
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
  if (event.attendees >= 250) {
    score += 20;
  } else if (event.attendees >= 150) {
    score += 15;
  } else if (event.attendees >= 75) {
    score += 10;
  } else {
    score += 5;
  }

  // Personal preference
  score += getPersonalizationScore(event);

  return score;
}

function eventsOverlap(first: Event, second: Event) {
  if (first.date !== second.date) {
    return false;
  }

  const firstStart = convertToMinutes(first.startTime);
  const firstEnd = convertToMinutes(first.endTime);

  const secondStart = convertToMinutes(second.startTime);
  const secondEnd = convertToMinutes(second.endTime);

  return (
    firstStart < secondEnd &&
    secondStart < firstEnd
  );
}

export function optimizeSchedule(
  events: Event[]
): SmartScheduleResult {
  if (events.length === 0) {
    return {
      selectedEvents: [],
      skippedEvents: [],
      score: 0,
      conflictsResolved: 0,
      reason: "No events are currently available.",
    };
  }

  const sortedEvents = [...events].sort(
    (a, b) => getEventScore(b) - getEventScore(a)
  );

  const selectedEvents: Event[] = [];
  const skippedEvents: Event[] = [];

  let conflictsResolved = 0;

  for (const event of sortedEvents) {
    const hasConflict = selectedEvents.some(
      (selectedEvent) =>
        eventsOverlap(event, selectedEvent)
    );

    if (!hasConflict) {
      selectedEvents.push(event);
    } else {
      skippedEvents.push(event);
      conflictsResolved++;
    }
  }

  const totalScore = selectedEvents.reduce(
    (sum, event) => sum + getEventScore(event),
    0
  );

  return {
    selectedEvents,
    skippedEvents,
    score: totalScore,
    conflictsResolved,
    reason:
      conflictsResolved > 0
        ? "NOVA selected the strongest combination of events while removing schedule conflicts."
        : "Your schedule is already conflict-free.",
  };
}