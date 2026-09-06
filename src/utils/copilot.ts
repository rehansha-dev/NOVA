import type { Event } from "../data/events";

export interface CopilotResult {
  message: string;
  events: Event[];
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function getEventDate(event: Event): Date | null {
  const parsed = new Date(event.date);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

function getAllEvents(): Event[] {
  const stored = localStorage.getItem("nova-events");

  if (!stored) {
    return [];
  }

  try {
    const createdEvents = JSON.parse(stored) as Event[];

    return Array.isArray(createdEvents)
      ? createdEvents
      : [];
  } catch {
    return [];
  }
}

export function getCopilotEvents(
  staticEvents: Event[],
  query: string
): CopilotResult {
  const text = normalize(query);

  const allEvents = [
    ...staticEvents,
    ...getAllEvents(),
  ];

  if (!text) {
    return {
      message:
        "Tell me what kind of campus event you're looking for.",
      events: [],
    };
  }

  /* =========================================
     CATEGORY DETECTION
  ========================================= */

  const categories = [
    "technology",
    "business",
    "cultural",
    "sports",
    "academic",
    "clubs",
  ];

  const matchedCategory = categories.find(
    (item) => text.includes(item)
  );

  if (matchedCategory) {
    const categoryName =
      matchedCategory.charAt(0).toUpperCase() +
      matchedCategory.slice(1);

    const matchingEvents = allEvents.filter(
      (event) =>
        event.category.toLowerCase() ===
        matchedCategory
    );

    return {
      message:
        matchingEvents.length > 0
          ? `I found ${matchingEvents.length} ${categoryName.toLowerCase()} event${
              matchingEvents.length === 1 ? "" : "s"
            } for you.`
          : `I couldn't find any ${categoryName.toLowerCase()} events right now.`,
      events: matchingEvents.slice(0, 5),
    };
  }

  /* =========================================
     POPULAR EVENTS
  ========================================= */

  const popularKeywords = [
    "popular",
    "trending",
    "biggest",
    "most attended",
    "crowded",
  ];

  if (
    popularKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    const popularEvents = [...allEvents]
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);

    return {
      message:
        "Here are the most popular events based on expected attendance.",
      events: popularEvents,
    };
  }

  /* =========================================
     TODAY
  ========================================= */

  if (
    text.includes("today") ||
    text.includes("happening today")
  ) {
    const today = new Date();

    const todayEvents = allEvents.filter((event) => {
      const eventDate = getEventDate(event);

      if (!eventDate) return false;

      return (
        eventDate.toDateString() ===
        today.toDateString()
      );
    });

    return {
      message:
        todayEvents.length > 0
          ? `There ${todayEvents.length === 1 ? "is" : "are"} ${
              todayEvents.length
            } event${
              todayEvents.length === 1 ? "" : "s"
            } happening today.`
          : "I couldn't find any events happening today.",
      events: todayEvents,
    };
  }

  /* =========================================
     THIS WEEK
  ========================================= */

  if (
    text.includes("this week") ||
    text.includes("week")
  ) {
    const now = new Date();

    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);

    const weekEvents = allEvents.filter((event) => {
      const eventDate = getEventDate(event);

      if (!eventDate) return false;

      return (
        eventDate >= now &&
        eventDate <= weekEnd
      );
    });

    weekEvents.sort((a, b) => {
      const dateA = getEventDate(a)?.getTime() ?? 0;
      const dateB = getEventDate(b)?.getTime() ?? 0;

      return dateA - dateB;
    });

    return {
      message:
        weekEvents.length > 0
          ? `I found ${weekEvents.length} upcoming event${
              weekEvents.length === 1 ? "" : "s"
            } over the next week.`
          : "I couldn't find any events scheduled over the next week.",
      events: weekEvents.slice(0, 5),
    };
  }

  /* =========================================
     VENUE SEARCH
  ========================================= */

  const venueMatches = allEvents.filter((event) =>
    event.venue.toLowerCase().includes(text)
  );

  if (venueMatches.length > 0) {
    return {
      message: `I found ${venueMatches.length} event${
        venueMatches.length === 1 ? "" : "s"
      } at that location.`,
      events: venueMatches.slice(0, 5),
    };
  }

  /* =========================================
     EVENT TITLE / DESCRIPTION SEARCH
  ========================================= */

  const searchMatches = allEvents.filter(
    (event) => {
      const searchableText = `
        ${event.title}
        ${event.description}
        ${event.category}
        ${event.venue}
      `.toLowerCase();

      const words = text
        .split(/\s+/)
        .filter((word) => word.length > 2);

      return words.some((word) =>
        searchableText.includes(word)
      );
    }
  );

  if (searchMatches.length > 0) {
    return {
      message: `I found ${searchMatches.length} event${
        searchMatches.length === 1 ? "" : "s"
      } that might match what you're looking for.`,
      events: searchMatches.slice(0, 5),
    };
  }

  /* =========================================
     FALLBACK
  ========================================= */

  return {
    message:
      "I couldn't find an exact match. Try asking for a category, popular events, events this week, or a specific event.",
    events: [],
  };
}