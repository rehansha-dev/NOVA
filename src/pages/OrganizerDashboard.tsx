import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";

interface OrganizerEvent {
  id: number;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  attendees: number;
  description: string;
}

function parseEventDate(event: OrganizerEvent) {
  if (!event.date) {
    return null;
  }

  // Handles YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    const time = event.startTime || "00:00";
    return new Date(`${event.date}T${time}`);
  }

  // Handles dates such as September 12, 2026
  const parsed = new Date(
    `${event.date} ${event.startTime || ""}`
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getEventStatus(event: OrganizerEvent) {
  const start = parseEventDate(event);

  if (!start) {
    return "upcoming";
  }

  const now = new Date();

  const end = new Date(start);

  const timeMatch = event.endTime?.match(
    /^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/i
  );

  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const modifier = timeMatch[3]?.toUpperCase();

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    end.setHours(hours, minutes, 0, 0);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
  } else {
    end.setHours(start.getHours() + 1);
  }

  if (now >= start && now <= end) {
    return "live";
  }

  if (now > end) {
    return "completed";
  }

  return "upcoming";
}

function formatDate(event: OrganizerEvent) {
  if (!event.date) {
    return {
      day: "—",
      month: "—",
    };
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    const date = new Date(`${event.date}T12:00:00`);

    return {
      day: date.getDate().toString(),
      month: date
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase(),
    };
  }

  const date = new Date(event.date);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "—",
      month: "—",
    };
  }

  return {
    day: date.getDate().toString(),
    month: date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase(),
  };
}

function OrganizerDashboard() {
  const createdEvents = useMemo<OrganizerEvent[]>(() => {
    const storedEvents = localStorage.getItem("nova-events");

    if (!storedEvents) {
      return [];
    }

    try {
      const parsedEvents = JSON.parse(storedEvents);

      return Array.isArray(parsedEvents) ? parsedEvents : [];
    } catch {
      return [];
    }
  }, []);

  const totalEvents = createdEvents.length;

  const totalAttendees = createdEvents.reduce(
    (total, event) =>
      total + Number(event.attendees || 0),
    0
  );

  const upcomingEvents = createdEvents.filter(
    (event) => getEventStatus(event) === "upcoming"
  ).length;

  const liveEvents = createdEvents.filter(
    (event) => getEventStatus(event) === "live"
  ).length;

  const mostPopularEvent = [...createdEvents].sort(
    (a, b) =>
      Number(b.attendees || 0) -
      Number(a.attendees || 0)
  )[0];

  const averageAttendance =
    totalEvents > 0
      ? Math.round(totalAttendees / totalEvents)
      : 0;

  const handleDeleteEvent = (eventId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    const storedEvents = localStorage.getItem("nova-events");

    if (!storedEvents) {
      return;
    }

    try {
      const parsedEvents = JSON.parse(storedEvents);

      const updatedEvents = parsedEvents.filter(
        (event: OrganizerEvent) =>
          event.id !== eventId
      );

      localStorage.setItem(
        "nova-events",
        JSON.stringify(updatedEvents)
      );

      window.location.reload();
    } catch {
      console.error("Unable to delete event.");
    }
  };

  return (
    <main className="organizer-page">

      {/* ================================
          HEADER
      ================================= */}

      <section className="organizer-header">

        <div>
          <p className="section-label">
            ORGANIZER HUB
          </p>

          <h1>
            Manage your
            <span> campus events.</span>
          </h1>

          <p className="organizer-subtitle">
            Create, manage and track the events
            you're organizing through NOVA.
          </p>
        </div>

        <Link
          to="/create"
          className="organizer-create-button"
        >
          <Plus size={17} />
          Create event
        </Link>

      </section>

      {/* ================================
          LIVE INDICATOR
      ================================= */}

      {liveEvents > 0 && (
        <div className="organizer-live-banner">
          <div className="organizer-live-dot" />

          <div>
            <strong>
              {liveEvents} event
              {liveEvents > 1 ? "s" : ""} happening now
            </strong>

            <span>
              Your campus is active right now.
            </span>
          </div>

          <Zap size={17} />
        </div>
      )}

      {/* ================================
          STATS
      ================================= */}

      <section className="organizer-stats">

        <div className="organizer-stat-card">

          <div className="organizer-stat-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Total events</span>
            <strong>{totalEvents}</strong>
          </div>

        </div>

        <div className="organizer-stat-card">

          <div className="organizer-stat-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Total attendees</span>
            <strong>{totalAttendees}</strong>
          </div>

        </div>

        <div className="organizer-stat-card">

          <div className="organizer-stat-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Upcoming events</span>
            <strong>{upcomingEvents}</strong>
          </div>

        </div>

        <div className="organizer-stat-card">

          <div className="organizer-stat-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Avg. attendance</span>
            <strong>{averageAttendance}</strong>
          </div>

        </div>

      </section>

      {/* ================================
          INSIGHTS
      ================================= */}

      {createdEvents.length > 0 && (
        <section className="organizer-insights">

          <div className="organizer-insight-card">

            <div className="organizer-insight-top">
              <span className="section-label">
                MOST POPULAR
              </span>

              <TrendingUp size={16} />
            </div>

            <h3>
              {mostPopularEvent?.title}
            </h3>

            <p>
              {mostPopularEvent?.attendees || 0} attendees
            </p>

          </div>

          <div className="organizer-insight-card">

            <div className="organizer-insight-top">
              <span className="section-label">
                SCHEDULE
              </span>

              <Clock3 size={16} />
            </div>

            <h3>
              {upcomingEvents} upcoming
            </h3>

            <p>
              {upcomingEvents === 1
                ? "event is"
                : "events are"}{" "}
              on your calendar
            </p>

          </div>

          <div className="organizer-insight-card">

            <div className="organizer-insight-top">
              <span className="section-label">
                STATUS
              </span>

              <CheckCircle2 size={16} />
            </div>

            <h3>
              {totalEvents > 0
                ? "You're active"
                : "Get started"}
            </h3>

            <p>
              Keep your campus engaged
            </p>

          </div>

        </section>
      )}

      {/* ================================
          MY EVENTS
      ================================= */}

      <section className="organizer-events-section">

        <div className="organizer-section-heading">

          <div>
            <p className="section-label">
              MANAGEMENT
            </p>

            <h2>My events</h2>
          </div>

          <Link
            to="/create"
            className="organizer-section-link"
          >
            Create event
            <ArrowRight size={15} />
          </Link>

        </div>

        {createdEvents.length > 0 ? (

          <div className="organizer-event-list">

            {createdEvents.map((event) => {

              const status =
                getEventStatus(event);

              const formattedDate =
                formatDate(event);

              return (
                <article
                  className="organizer-event-card"
                  key={event.id}
                >

                  {/* DATE */}

                  <div className="organizer-event-date">

                    <strong>
                      {formattedDate.day}
                    </strong>

                    <span>
                      {formattedDate.month}
                    </span>

                  </div>

                  {/* EVENT */}

                  <div className="organizer-event-main">

                    <div className="organizer-event-heading-row">

                      <p className="organizer-event-category">
                        {event.category}
                      </p>

                      <span
                        className={`organizer-status organizer-status-${status}`}
                      >
                        {status === "live" && (
                          <span className="organizer-status-dot" />
                        )}

                        {status}
                      </span>

                    </div>

                    <h3>
                      {event.title}
                    </h3>

                    <div className="organizer-event-meta">

                      <span>
                        {event.startTime} –{" "}
                        {event.endTime}
                      </span>

                      <span>
                        {event.venue}
                      </span>

                      <span>
                        {event.attendees || 0} attendees
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="organizer-event-actions">

                    <Link
                      to={`/organizer/edit/${event.id}`}
                      className="organizer-edit-button"
                      title="Edit event"
                    >
                      <Edit3 size={14} />
                      Edit
                    </Link>

                    <Link
                      to={`/event/${event.id}`}
                      className="organizer-view-button"
                    >
                      View
                      <ArrowRight size={15} />
                    </Link>

                    <button
                      className="organizer-delete-button"
                      onClick={() =>
                        handleDeleteEvent(event.id)
                      }
                      aria-label={`Delete ${event.title}`}
                      title="Delete event"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        ) : (

          <div className="organizer-empty">

            <div className="organizer-empty-icon">
              <CalendarDays size={28} />
            </div>

            <p className="section-label">
              NO EVENTS YET
            </p>

            <h3>
              Your organizer space is ready.
            </h3>

            <p>
              Create your first campus event and
              start building your audience.
            </p>

            <Link
              to="/create"
              className="organizer-empty-button"
            >
              Create your first event
              <Plus size={16} />
            </Link>

          </div>

        )}

      </section>

    </main>
  );
}

export default OrganizerDashboard;