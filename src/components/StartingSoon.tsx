import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

import { events, type Event } from "../data/events";

function getAllEvents(): Event[] {
  const stored = localStorage.getItem("nova-events");

  if (!stored) {
    return events;
  }

  try {
    const createdEvents = JSON.parse(stored) as Event[];

    return [...events, ...createdEvents];
  } catch {
    return events;
  }
}

/* =========================================
   CONVERT DATE + TIME
========================================= */

function convertToDate(
  date: string,
  time: string
): Date | null {
  let year: number;
  let month: number;
  let day: number;

  /* Created event: 2026-09-05 */

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [rawYear, rawMonth, rawDay] = date
      .split("-")
      .map(Number);

    year = rawYear;
    month = rawMonth - 1;
    day = rawDay;
  }

  /* Existing event: September 12, 2026 */

  else {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    year = parsedDate.getFullYear();
    month = parsedDate.getMonth();
    day = parsedDate.getDate();
  }

  let hours: number;
  let minutes: number;

  /* 12-hour time: 2:00 PM */

  if (
    time.includes("AM") ||
    time.includes("PM")
  ) {
    const [timePart, modifier] =
      time.split(" ");

    [hours, minutes] = timePart
      .split(":")
      .map(Number);

    if (
      modifier === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      modifier === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }
  }

  /* 24-hour time: 23:50 */

  else {
    [hours, minutes] = time
      .split(":")
      .map(Number);
  }

  return new Date(
    year,
    month,
    day,
    hours,
    minutes,
    0,
    0
  );
}

/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date: string) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    const [year, month, day] = date
      .split("-")
      .map(Number);

    const parsed = new Date(
      year,
      month - 1,
      day
    );

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

/* =========================================
   TIME UNTIL
========================================= */

function getTimeUntil(startDate: Date) {
  const now = new Date();

  const difference =
    startDate.getTime() -
    now.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes <= 0) {
    return "Happening now";
  }

  if (minutes < 60) {
    return `Starts in ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `Starts in ${hours}h`;
  }

  return `Starts in ${hours}h ${remainingMinutes}m`;
}

/* =========================================
   STARTING SOON
========================================= */

function StartingSoon() {
  const now = new Date();

  const upcomingEvents = getAllEvents()
    .map((event) => {
      const start = convertToDate(
        event.date,
        event.startTime
      );

      let end = convertToDate(
        event.date,
        event.endTime
      );

      /*
        IMPORTANT:

        If end time is earlier than start time,
        the event crosses midnight.

        Example:

        23:50 → 01:30

        becomes:

        Sep 5 23:50 → Sep 6 01:30
      */

      if (
        start &&
        end &&
        end.getTime() <= start.getTime()
      ) {
        end = new Date(end.getTime());

        end.setDate(
          end.getDate() + 1
        );
      }

      return {
        event,
        start,
        end,
      };
    })

    .filter((item) => {
      if (
        !item.start ||
        !item.end
      ) {
        return false;
      }

      const nowTime =
        now.getTime();

      const startTime =
        item.start.getTime();

      const endTime =
        item.end.getTime();

      /*
        Event has already finished.
      */

      if (endTime <= nowTime) {
        return false;
      }

      /*
        Show:

        • Events starting within 24 hours
        • Events currently happening
      */

      const twentyFourHours =
        24 * 60 * 60 * 1000;

      const startsSoon =
        startTime <=
        nowTime + twentyFourHours;

      const happeningNow =
        startTime <= nowTime &&
        endTime > nowTime;

      return (
        startsSoon ||
        happeningNow
      );
    })

    .sort((a, b) => {
      return (
        a.start!.getTime() -
        b.start!.getTime()
      );
    })

    .slice(0, 3);

  if (
    upcomingEvents.length === 0
  ) {
    return null;
  }

  return (
    <section className="starting-soon-section">

      {/* HEADER */}

      <div className="starting-soon-header">
        <div>
          <p className="section-label">
            HAPPENING SOON
          </p>

          <h2>
            Don't miss what's
            <span> coming up.</span>
          </h2>
        </div>

        <Link
          to="/discover"
          className="starting-soon-link"
        >
          View all
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* EVENTS */}

      <div className="starting-soon-list">

        {upcomingEvents.map(
          ({ event, start }) => (
            <article
              className="starting-soon-card"
              key={event.id}
            >

              <div className="starting-soon-indicator">
                <span />
              </div>

              <div className="starting-soon-main">

                <div className="starting-soon-top">

                  <span className="starting-soon-category">
                    {event.category}
                  </span>

                  <strong>
                    {getTimeUntil(
                      start!
                    )}
                  </strong>

                </div>

                <h3>
                  {event.title}
                </h3>

                <div className="starting-soon-meta">

                  <span>
                    <CalendarDays size={13} />

                    {formatDate(
                      event.date
                    )}
                  </span>

                  <span>
                    <Clock3 size={13} />

                    {event.startTime} –{" "}
                    {event.endTime}
                  </span>

                  <span>
                    <MapPin size={13} />

                    {event.venue}
                  </span>

                </div>

              </div>

              <Link
                to={`/event/${event.id}`}
                className="starting-soon-view"
                aria-label={`View ${event.title}`}
              >
                <ArrowRight size={17} />
              </Link>

            </article>
          )
        )}

      </div>

    </section>
  );
}

export default StartingSoon;