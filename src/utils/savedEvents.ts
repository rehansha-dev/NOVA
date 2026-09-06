import type { Event } from "../data/events";
import { getCurrentUser } from "./auth";

const STORAGE_PREFIX = "nova-saved-events";

function getStorageKey(): string | null {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  return `${STORAGE_PREFIX}-${user.id}`;
}

export function getSavedEventIds(): number[] {
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
  } catch {
    return [];
  }
}

export function isEventSaved(eventId: number): boolean {
  return getSavedEventIds().includes(eventId);
}

export function saveEvent(eventId: number) {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return;
  }

  const currentIds = getSavedEventIds();

  if (currentIds.includes(eventId)) {
    return;
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify([...currentIds, eventId])
  );
}

export function unsaveEvent(eventId: number) {
  const storageKey = getStorageKey();

  if (!storageKey) {
    return;
  }

  const currentIds = getSavedEventIds();

  const updatedIds = currentIds.filter(
    (id) => id !== eventId
  );

  localStorage.setItem(
    storageKey,
    JSON.stringify(updatedIds)
  );
}

export function toggleSavedEvent(eventId: number) {
  if (isEventSaved(eventId)) {
    unsaveEvent(eventId);
  } else {
    saveEvent(eventId);
  }
}

export function getSavedEvents(
  events: Event[]
): Event[] {
  const savedIds = getSavedEventIds();

  return events.filter((event) =>
    savedIds.includes(event.id)
  );
}