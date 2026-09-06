import { events as staticEvents, type Event } from "../data/events";
import { getUserRSVPs } from "./rsvp";

export interface PersonalizationProfile {
  categoryCounts: Record<string, number>;
  totalRSVPs: number;
  favoriteCategory: string | null;
}

function getAllEvents(): Event[] {
  const storedEvents = localStorage.getItem("nova-events");

  let createdEvents: Event[] = [];

  try {
    const parsed = storedEvents ? JSON.parse(storedEvents) : [];
    createdEvents = Array.isArray(parsed) ? parsed : [];
  } catch {
    createdEvents = [];
  }

  return [...staticEvents, ...createdEvents];
}

export function buildPersonalizationProfile(): PersonalizationProfile {
  const rsvps = getUserRSVPs();
  const allEvents = getAllEvents();

  const categoryCounts: Record<string, number> = {};

  rsvps.forEach((rsvp) => {
    const event = allEvents.find(
      (item) => item.id === rsvp.eventId
    );

    if (!event) return;

    categoryCounts[event.category] =
      (categoryCounts[event.category] || 0) + 1;
  });

  let favoriteCategory: string | null = null;

  Object.entries(categoryCounts).forEach(
    ([category, count]) => {
      if (
        favoriteCategory === null ||
        count > categoryCounts[favoriteCategory]
      ) {
        favoriteCategory = category;
      }
    }
  );

  return {
    categoryCounts,
    totalRSVPs: rsvps.length,
    favoriteCategory,
  };
}

export function getPersonalizationScore(
  event: Event
): number {
  const profile = buildPersonalizationProfile();

  if (!profile.favoriteCategory) {
    return 0;
  }

  const categoryCount =
    profile.categoryCounts[event.category] || 0;

  if (event.category === profile.favoriteCategory) {
    return Math.min(30, 15 + categoryCount * 5);
  }

  if (categoryCount > 0) {
    return Math.min(15, categoryCount * 5);
  }

  return 0;
}