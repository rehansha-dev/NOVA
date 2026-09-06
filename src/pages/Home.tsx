import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { events } from "../data/events";
import StartingSoon from "../components/StartingSoon";
import { getCurrentUser } from "../utils/auth";
import { getScheduledEvents } from "../utils/schedule";

function Home() {
  const currentUser = getCurrentUser();
  const scheduledEvents = getScheduledEvents();

  const firstName =
    currentUser?.name?.split(" ")[0] || "there";

  const plannedCount = scheduledEvents.length;

  const nextEvent =
    scheduledEvents.length > 0
      ? scheduledEvents[0]
      : null;

  return (
    <main className="home-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="home-hero">

        <div className="hero-copy">

          <p className="eyebrow">
            WELCOME BACK, {firstName.toUpperCase()}.
          </p>

          <h1>
            Everything happening
            <span> around you.</span>
          </h1>

          <p className="hero-text">
            Discover campus events, build your schedule,
            and make sure you never miss the experiences
            that matter.
          </p>

          <div className="hero-actions">

            <Link
              to="/discover"
              className="primary-button"
            >
              Explore Events
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/calendar"
              className="secondary-button"
            >
              <CalendarDays size={17} />
              My Schedule
            </Link>

          </div>

        </div>


        {/* =========================================
            HERO VISUAL
        ========================================= */}

        <div className="hero-visual">

          <div className="hero-glow" />

          <div className="floating-event-card">

            <div className="mini-label">
              NEXT UP
            </div>

            <h3>
              AI & Machine Learning Workshop
            </h3>

            <div className="mini-info">

              <span>
                <CalendarDays size={14} />
                September 12 · 2:00 PM
              </span>

              <span>
                <MapPin size={14} />
                Innovation Hub
              </span>

            </div>

            <div className="mini-footer">

              <span>
                <Users size={14} />
                128 going
              </span>

              <span className="live-dot">
                ● LIVE
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          PERSONAL CAMPUS COMMAND CENTER
      ========================================= */}

      <section className="home-command-center">

        <div className="command-heading">

          <div>

            <p className="section-label">
              YOUR CAMPUS
            </p>

            <h2>
              Your campus,
              <span> at a glance.</span>
            </h2>

          </div>

          <Link
            to="/calendar"
            className="command-open-link"
          >
            Open schedule
            <ArrowRight size={15} />
          </Link>

        </div>


        <div className="command-dashboard">

          {/* =====================================
              NEXT UP CARD
          ===================================== */}

          <Link
            to="/calendar"
            className="command-next-card"
          >

            <div className="command-card-header">

              <div className="command-card-icon">
                <Clock3 size={17} />
              </div>

              <span>
                NEXT UP
              </span>

            </div>


            {nextEvent ? (

              <div className="command-next-content">

                <p className="command-event-category">
                  {nextEvent.category}
                </p>

                <h3>
                  {nextEvent.title}
                </h3>

                <div className="command-event-info">

                  <span>
                    <Clock3 size={13} />
                    {nextEvent.startTime} –{" "}
                    {nextEvent.endTime}
                  </span>

                  <span>
                    <MapPin size={13} />
                    {nextEvent.venue}
                  </span>

                </div>

              </div>

            ) : (

              <div className="command-no-event">

                <div className="command-big-number">
                  0
                </div>

                <h3>
                  Nothing planned yet.
                </h3>

                <p>
                  Find an event and start building
                  your campus schedule.
                </p>

              </div>

            )}


            <div className="command-card-footer">

              <span>
                {nextEvent
                  ? "View schedule"
                  : "Explore events"}
              </span>

              <ArrowRight size={15} />

            </div>

          </Link>


          {/* =====================================
              SCHEDULE CARD
          ===================================== */}

          <Link
            to="/calendar"
            className="command-schedule-card"
          >

            <div className="command-card-header">

              <div className="command-card-icon">
                <CalendarDays size={17} />
              </div>

              <span>
                YOUR SCHEDULE
              </span>

            </div>


            <div className="command-schedule-number">
              {plannedCount}
            </div>

            <h3>
              {plannedCount === 1
                ? "event planned"
                : "events planned"}
            </h3>

            <p>
              Your personal campus schedule,
              organized in one place.
            </p>


            <div className="command-card-footer">

              <span>
                Manage schedule
              </span>

              <ArrowRight size={15} />

            </div>

          </Link>


          {/* =====================================
              CAMPUS ACTIVITY CARD
          ===================================== */}

          <Link
            to="/discover"
            className="command-discover-card"
          >

            <div className="command-card-header">

              <div className="command-card-icon">
                <Users size={17} />
              </div>

              <span>
                CAMPUS ACTIVITY
              </span>

            </div>


            <div className="command-discover-number">
              {events.length}
            </div>

            <h3>
              events to explore
            </h3>

            <p>
              Discover workshops, competitions,
              cultural events and more.
            </p>


            <div className="command-card-footer">

              <span>
                Explore campus
              </span>

              <ArrowRight size={15} />

            </div>

          </Link>


          {/* =====================================
              SMART STATUS STRIP
          ===================================== */}

          <div className="command-smart-strip">

            <div className="command-smart-icon">
              <CheckCircle2 size={17} />
            </div>

            <div className="command-smart-copy">

              <span>
                NOVA SMART
              </span>

              <strong>
                Your schedule is being checked
                for clashes.
              </strong>

            </div>

            <Link
              to="/calendar"
              className="command-smart-link"
              aria-label="Open smart schedule"
            >
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          STARTING SOON
      ========================================= */}

      <StartingSoon />


      {/* =========================================
          DISCOVER
      ========================================= */}

      <section className="home-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              DISCOVER
            </p>

            <h2>
              Happening on campus
            </h2>

          </div>

          <Link
            to="/discover"
            className="text-button"
          >
            View all
            <ArrowRight size={15} />
          </Link>

        </div>


        <div className="event-grid">

          {events.slice(0, 3).map((event) => (

            <article
              className="event-card"
              key={event.id}
            >

              <div className="event-cover">

                <span className="event-category">
                  {event.category}
                </span>

                <button
                  className="save-event"
                  aria-label={`Save ${event.title}`}
                >
                  ♡
                </button>

                <div className="event-date">

                  <strong>
                    {event.date
                      .split(" ")[1]
                      .replace(",", "")}
                  </strong>

                  <small>
                    {event.date
                      .split(" ")[0]
                      .slice(0, 3)}
                  </small>

                </div>

              </div>


              <div className="event-body">

                <h3>
                  {event.title}
                </h3>

                <div className="event-details">

                  <span>
                    <CalendarDays size={14} />
                    {event.startTime} –{" "}
                    {event.endTime}
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
                    View
                    <ArrowRight size={14} />
                  </Link>

                </div>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* =========================================
          NOVA SMART
      ========================================= */}

      <section className="smart-preview">

        <div>

          <p className="section-label">
            NOVA SMART
          </p>

          <h2>
            Your schedule,
            <br />
            <span>
              without the chaos.
            </span>
          </h2>

          <p>
            NOVA detects event clashes and helps you
            build a schedule that actually works.
          </p>

          <Link
            to="/calendar"
            className="primary-button"
          >
            Open Smart Schedule
            <ArrowRight size={17} />
          </Link>

        </div>


        <div className="schedule-preview">

          <div className="schedule-title">

            <span>
              YOUR DAY
            </span>

            <span>
              {plannedCount}{" "}
              {plannedCount === 1
                ? "EVENT"
                : "EVENTS"}
            </span>

          </div>


          <div className="schedule-item">

            <time>
              10:00
            </time>

            <div>

              <strong>
                AI Seminar
              </strong>

              <small>
                Innovation Hub
              </small>

            </div>

          </div>


          <div className="schedule-item active">

            <time>
              14:00
            </time>

            <div>

              <strong>
                AI Workshop
              </strong>

              <small>
                Innovation Hub
              </small>

            </div>

          </div>


          <div className="schedule-conflict">

            <span>
              ⚠
            </span>

            <div>

              <strong>
                Schedule conflict
              </strong>

              <small>
                Startup Meetup overlaps this event
              </small>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;