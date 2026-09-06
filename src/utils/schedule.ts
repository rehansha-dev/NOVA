import type { Event } from "../data/events";
import { getCurrentUser } from "./auth";

const STORAGE_PREFIX = "nova-scheduled-events";

function getStorageKey(): string | null {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  return `${STORAGE_PREFIX}-${user.id}`;
}

function loadScheduledEvents(): Event[] {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return [];
  }

  const stored = localStorage.getItem(storageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "NOVA: Could not read scheduled events",
      error
    );

    return [];
  }
}

export function getScheduledEvents(): Event[] {
  return loadScheduledEvents();
}

export function addToSchedule(event: Event) {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return;
  }

  const currentEvents = loadScheduledEvents();

  const alreadyScheduled = currentEvents.some(
    (item) => item.id === event.id
  );

  if (alreadyScheduled) {
    return;
  }

  const updatedEvents = [
    ...currentEvents,
    event,
  ];

  localStorage.setItem(
    storageKey,
    JSON.stringify(updatedEvents)
  );
}

export function removeFromSchedule(eventId: number) {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return;
  }

  const currentEvents = loadScheduledEvents();

  const updatedEvents = currentEvents.filter(
    (event) => event.id !== eventId
  );

  localStorage.setItem(
    storageKey,
    JSON.stringify(updatedEvents)
  );
}