import {
  ArrowRight,
  Bookmark,
  Heart,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { events, type Event } from "../data/events";
import {
  getSavedEventIds,
  unsaveEvent,
} from "../utils/savedEvents";
import { useState } from "react";

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

function Saved() {
  const [savedIds, setSavedIds] = useState<number[]>(
    () => getSavedEventIds()
  );

  const allEvents = getAllEvents();

  const savedEvents = allEvents.filter((event) =>
    savedIds.includes(event.id)
  );

  const handleRemove = (eventId: number) => {
    unsaveEvent(eventId);

    setSavedIds(getSavedEventIds());
  };

  return (
    <main className="saved-page">
      <section className="saved-header">
        <div>
          <p className="section-label">YOUR SAVED EVENTS</p>

          <h1>
            Things worth
            <span> coming back to.</span>
          </h1>

          <p className="saved-subtitle">
            Keep track of events you're interested in
            and decide what deserves a spot on your
            schedule.
          </p>
        </div>

        <div className="saved-stat">
          <strong>{savedEvents.length}</strong>
          <span>
            {savedEvents.length === 1
              ? "saved event"
              : "saved events"}
          </span>
        </div>
      </section>

      <section className="saved-content">
        <div className="saved-section-heading">
          <div>
            <p className="section-label">BOOKMARKED</p>
            <h2>Your saved events</h2>
          </div>

          <Link
            to="/discover"
            className="saved-discover-link"
          >
            Discover more
            <ArrowRight size={15} />
          </Link>
        </div>

        {savedEvents.length > 0 ? (
          <div className="saved-grid">
            {savedEvents.map((event) => {
              const dateParts = event.date.split(" ");

              return (
                <article
                  className="saved-card"
                  key={event.id}
                >
                  <div className="saved-card-top">
                    <div className="saved-date">
                      <strong>
                        {dateParts[1]?.replace(",", "")}
                      </strong>

                      <span>
                        {dateParts[0]?.slice(0, 3)}
                      </span>
                    </div>

                    <span className="saved-category">
                      {event.category}
                    </span>

                    <button
                      className="saved-remove"
                      onClick={() =>
                        handleRemove(event.id)
                      }
                      aria-label={`Remove ${event.title} from saved events`}
                      title="Remove from saved"
                    >
                      <Heart
                        size={17}
                        fill="currentColor"
                      />
                    </button>
                  </div>

                  <div className="saved-card-body">
                    <h3>{event.title}</h3>

                    <p>
                      {event.description}
                    </p>

                    <div className="saved-card-meta">
                      <span>
                        {event.startTime} –{" "}
                        {event.endTime}
                      </span>

                      <span>
                        {event.venue}
                      </span>
                    </div>
                  </div>

                  <div className="saved-card-footer">
                    <span>
                      {event.attendees} people going
                    </span>

                    <Link
                      to={`/event/${event.id}`}
                      className="saved-view-button"
                    >
                      View event
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty">
            <div className="saved-empty-icon">
              <Bookmark size={28} />
            </div>

            <p className="section-label">
              NOTHING SAVED YET
            </p>

            <h3>Build your shortlist.</h3>

            <p>
              Save events you might want to attend.
              They'll stay here until you're ready to
              make a decision.
            </p>

            <Link
              to="/discover"
              className="saved-empty-button"
            >
              Explore events
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default Saved;