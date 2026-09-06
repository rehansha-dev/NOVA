import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  getScheduledEvents,
  removeFromSchedule,
} from "../utils/schedule";

import { optimizeSchedule } from "../utils/smartSchedule";

function Calendar() {
  const [scheduledEvents, setScheduledEvents] = useState(
    getScheduledEvents()
  );

  const [showOptimizer, setShowOptimizer] = useState(false);

  const [optimization, setOptimization] = useState<
    ReturnType<typeof optimizeSchedule> | null
  >(null);

  const handleRemove = (eventId: number) => {
    removeFromSchedule(eventId);

    setScheduledEvents(getScheduledEvents());

    // Close optimizer if it is open
    setShowOptimizer(false);
    setOptimization(null);
  };

  const handleOptimize = () => {
    // IMPORTANT:
    // Only optimize events that are actually
    // present in the user's calendar.
    const result = optimizeSchedule(scheduledEvents);

    setOptimization(result);
    setShowOptimizer(true);
  };

  return (
    <main className="calendar-page">
      <section className="calendar-header">
        <div>
          <p className="section-label">YOUR SCHEDULE</p>

          <h1>
            Plan your
            <span> campus life.</span>
          </h1>

          <p className="calendar-subtitle">
            Everything you're planning to attend,
            organized in one place.
          </p>
        </div>

        <div className="calendar-stat">
          <strong>{scheduledEvents.length}</strong>
          <span>events planned</span>
        </div>
      </section>

      {/* SMART OPTIMIZER */}
      {scheduledEvents.length > 0 && (
        <section className="nova-optimizer-trigger">
          <div className="nova-optimizer-trigger-content">
            <div className="nova-optimizer-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="section-label">
                NOVA SMART
              </p>

              <h2>
                Optimize your schedule.
              </h2>

              <p>
                Let NOVA analyze your events and find
                the strongest conflict-free combination.
              </p>
            </div>
          </div>

          <button
            className="nova-optimize-button"
            onClick={handleOptimize}
          >
            <Sparkles size={15} />
            Optimize My Schedule
          </button>
        </section>
      )}

      <section className="calendar-content">
        <div className="calendar-section-heading">
          <div>
            <p className="section-label">UPCOMING</p>
            <h2>Your events</h2>
          </div>

          <Link
            to="/discover"
            className="calendar-discover-link"
          >
            Discover more
            <ArrowRight size={15} />
          </Link>
        </div>

        {scheduledEvents.length > 0 ? (
          <div className="calendar-event-list">
            {scheduledEvents.map((event) => (
              <article
                className="calendar-event"
                key={event.id}
              >
                <div className="calendar-event-date">
                  <strong>
                    {event.date
                      .split(" ")[1]
                      ?.replace(",", "")}
                  </strong>

                  <span>
                    {event.date
                      .split(" ")[0]
                      ?.slice(0, 3)}
                  </span>
                </div>

                <div className="calendar-event-main">
                  <div className="calendar-event-category">
                    {event.category}
                  </div>

                  <h3>{event.title}</h3>

                  <div className="calendar-event-meta">
                    <span>
                      <Clock3 size={14} />
                      {event.startTime} – {event.endTime}
                    </span>

                    <span>
                      <MapPin size={14} />
                      {event.venue}
                    </span>

                    <span>
                      <Users size={14} />
                      {event.attendees} going
                    </span>
                  </div>
                </div>

                <div className="calendar-event-actions">
                  <div className="calendar-going-status">
                    <Check size={14} />
                    Going
                  </div>

                  <Link
                    to={`/event/${event.id}`}
                    className="calendar-view-link"
                  >
                    View
                    <ArrowRight size={15} />
                  </Link>

                  <button
                    className="calendar-remove-button"
                    onClick={() =>
                      handleRemove(event.id)
                    }
                    aria-label={`Remove ${event.title} from schedule`}
                    title="Remove from schedule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="calendar-empty">
            <div className="calendar-empty-icon">
              <CalendarDays size={28} />
            </div>

            <p className="section-label">
              YOUR SCHEDULE IS EMPTY
            </p>

            <h3>Nothing planned yet.</h3>

            <p>
              Explore campus events and mark the ones
              you want to attend. NOVA will build your
              schedule automatically.
            </p>

            <Link
              to="/discover"
              className="calendar-empty-button"
            >
              Explore events
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* OPTIMIZER PANEL */}
      {showOptimizer && optimization && (
        <div className="nova-optimizer-overlay">
          <div className="nova-optimizer-panel">
            <button
              className="nova-optimizer-close"
              onClick={() => {
                setShowOptimizer(false);
                setOptimization(null);
              }}
              aria-label="Close optimizer"
            >
              <X size={18} />
            </button>

            <div className="nova-optimizer-panel-header">
              <div className="nova-optimizer-panel-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="section-label">
                  NOVA SMART SCHEDULE
                </p>

                <h2>
                  Your schedule,
                  <span> optimized.</span>
                </h2>
              </div>
            </div>

            <div className="nova-optimizer-stats">
              <div>
                <strong>
                  {optimization.score}
                </strong>

                <span>SCHEDULE SCORE</span>
              </div>

              <div>
                <strong>
                  {optimization.selectedEvents.length}
                </strong>

                <span>EVENTS SELECTED</span>
              </div>

              <div>
                <strong>
                  {optimization.conflictsResolved}
                </strong>

                <span>CONFLICTS RESOLVED</span>
              </div>
            </div>

            <div className="nova-optimizer-message">
              <p>{optimization.reason}</p>
            </div>

            <div className="nova-optimizer-events">
              <div className="nova-optimizer-column">
                <p className="section-label">
                  RECOMMENDED
                </p>

                {optimization.selectedEvents.map(
                  (event) => (
                    <div
                      className="nova-optimizer-event"
                      key={event.id}
                    >
                      <div>
                        <span>
                          {event.category}
                        </span>

                        <strong>
                          {event.title}
                        </strong>

                        <small>
                          {event.date} ·{" "}
                          {event.startTime} –{" "}
                          {event.endTime}
                        </small>
                      </div>

                      <Check size={16} />
                    </div>
                  )
                )}
              </div>

              {optimization.skippedEvents.length >
                0 && (
                <div className="nova-optimizer-column nova-skipped">
                  <p className="section-label">
                    SKIPPED DUE TO CONFLICT
                  </p>

                  {optimization.skippedEvents.map(
                    (event) => (
                      <div
                        className="nova-optimizer-event"
                        key={event.id}
                      >
                        <div>
                          <span>
                            {event.category}
                          </span>

                          <strong>
                            {event.title}
                          </strong>

                          <small>
                            {event.date} ·{" "}
                            {event.startTime} –{" "}
                            {event.endTime}
                          </small>
                        </div>

                        <X size={15} />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="nova-optimizer-footer">
              <p>
                NOVA recommendations don't change
                your schedule automatically.
              </p>

              <button
                onClick={() => {
                  setShowOptimizer(false);
                  setOptimization(null);
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Calendar;