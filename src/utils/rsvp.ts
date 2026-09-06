import { getCurrentUser } from "./auth";

interface RSVPRecord {
  userId: string;
  eventId: number;
  createdAt: string;
}

const RSVP_STORAGE_KEY = "nova-rsvps";

function getAllRSVPs(): RSVPRecord[] {
  const stored = localStorage.getItem(RSVP_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllRSVPs(rsvps: RSVPRecord[]) {
  localStorage.setItem(
    RSVP_STORAGE_KEY,
    JSON.stringify(rsvps)
  );
}

export function isGoing(eventId: number): boolean {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return false;
  }

  const rsvps = getAllRSVPs();

  return rsvps.some(
    (rsvp) =>
      rsvp.userId === currentUser.id &&
      rsvp.eventId === eventId
  );
}

export function addRSVP(eventId: number): boolean {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return false;
  }

  const rsvps = getAllRSVPs();

  const alreadyGoing = rsvps.some(
    (rsvp) =>
      rsvp.userId === currentUser.id &&
      rsvp.eventId === eventId
  );

  if (alreadyGoing) {
    return true;
  }

  const newRSVP: RSVPRecord = {
    userId: currentUser.id,
    eventId,
    createdAt: new Date().toISOString(),
  };

  saveAllRSVPs([...rsvps, newRSVP]);

  return true;
}

export function removeRSVP(eventId: number): boolean {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return false;
  }

  const rsvps = getAllRSVPs();

  const updatedRSVPs = rsvps.filter(
    (rsvp) =>
      !(
        rsvp.userId === currentUser.id &&
        rsvp.eventId === eventId
      )
  );

  saveAllRSVPs(updatedRSVPs);

  return true;
}

export function getEventRSVPCount(
  eventId: number
): number {
  const rsvps = getAllRSVPs();

  return rsvps.filter(
    (rsvp) => rsvp.eventId === eventId
  ).length;
}

export function getUserRSVPs(): RSVPRecord[] {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return [];
  }

  return getAllRSVPs().filter(
    (rsvp) => rsvp.userId === currentUser.id
  );
}