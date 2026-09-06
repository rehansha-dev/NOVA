import {
  CalendarDays,
  Heart,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "../data/events";

interface EventCardProps {
  event: Event;
  saved?: boolean;
  onSave?: (id: number) => void;
}

function EventCard({
  event,
  saved = false,
  onSave,
}: EventCardProps) {
  const dateParts = event.date.split(" ");

  return (
    <article className="event-card">
      <div className="event-cover">
        <span className="event-category">
          {event.category}
        </span>

        <button
          className={`save-event ${saved ? "saved" : ""}`}
          onClick={() => onSave?.(event.id)}
          aria-label={
            saved
              ? "Remove from saved events"
              : "Save event"
          }
        >
          <Heart
            size={17}
            fill={saved ? "currentColor" : "none"}
          />
        </button>

        <div className="event-date">
          <strong>
            {dateParts[1]?.replace(",", "")}
          </strong>
          <small>
            {dateParts[0]?.slice(0, 3)}
          </small>
        </div>
      </div>

      <div className="event-body">
        <h3>{event.title}</h3>

        <p className="event-description">
          {event.description}
        </p>

        <div className="event-details">
          <span>
            <CalendarDays size={14} />
            {event.startTime} – {event.endTime}
          </span>

          <span>
            <MapPin size={14} />
            {event.venue}
          </span>
        </div>

        <div className="event-bottom">
          <span>
            <Users size={14} />
            {event.attendees} going
          </span>

          <Link
            to={`/event/${event.id}`}
            className="view-event-button"
          >
            View event →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;