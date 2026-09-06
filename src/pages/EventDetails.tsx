import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { events, type Event } from "../data/events";

import {
  getSavedEventIds,
  toggleSavedEvent,
} from "../utils/savedEvents";

import { findTimeClash } from "../utils/clashDetection";
import { optimizeClash } from "../utils/scheduleOptimizer";

import {
  addToSchedule,
  getScheduledEvents,
  removeFromSchedule,
} from "../utils/schedule";

import {
  addRSVP,
  getEventRSVPCount,
  isGoing as isRSVPGoing,
  removeRSVP,
} from "../utils/rsvp";


function getAllEvents(): Event[] {
  const stored = localStorage.getItem("nova-events");

  if (!stored) {
    return events;
  }

  try {
    const createdEvents = JSON.parse(
      stored
    ) as Event[];

    return [...events, ...createdEvents];
  } catch {
    return events;
  }
}


/* =========================================
   CLASH DURATION
========================================= */

function convertToMinutes(time: string) {
  /*
    12-hour format:
    2:00 PM
  */

  if (
    time.includes("AM") ||
    time.includes("PM")
  ) {
    const [timePart, modifier] =
      time.split(" ");

    let [hours, minutes] = timePart
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

    return hours * 60 + minutes;
  }

  /*
    24-hour format:
    14:00
  */

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}


function getOverlapDuration(
  event: Event,
  conflictingEvent: Event
) {
  const eventStart = convertToMinutes(
    event.startTime
  );

  const eventEnd = convertToMinutes(
    event.endTime
  );

  const conflictStart =
    convertToMinutes(
      conflictingEvent.startTime
    );

  const conflictEnd =
    convertToMinutes(
      conflictingEvent.endTime
    );

  const overlapStart = Math.max(
    eventStart,
    conflictStart
  );

  const overlapEnd = Math.min(
    eventEnd,
    conflictEnd
  );

  const overlapMinutes =
    Math.max(
      0,
      overlapEnd - overlapStart
    );

  if (overlapMinutes < 60) {
    return `${overlapMinutes} min overlap`;
  }

  const hours = Math.floor(
    overlapMinutes / 60
  );

  const minutes = overlapMinutes % 60;

  if (minutes === 0) {
    return `${hours}h overlap`;
  }

  return `${hours}h ${minutes}m overlap`;
}


/* =========================================
   EVENT DETAILS
========================================= */

function EventDetails() {
  const { id } = useParams();

  const allEvents = getAllEvents();

  const event = allEvents.find(
    (item) =>
      item.id === Number(id)
  );

  const [saved, setSaved] = useState(() =>
    getSavedEventIds().includes(
      Number(id)
    )
  );

  /*
    RSVP state

    This comes from the RSVP system
    instead of only the personal schedule.
  */

  const [going, setGoing] = useState(() =>
    isRSVPGoing(Number(id))
  );

  const [rsvpCount, setRsvpCount] = useState(() =>
    getEventRSVPCount(Number(id))
  );

  const [
    conflictingEvent,
    setConflictingEvent,
  ] = useState<Event | null>(null);

  /*
    NOVA SMART OPTIMIZER

    When a clash exists, NOVA compares
    both events and recommends the stronger
    option.
  */

  const optimizerResult =
    event && conflictingEvent
      ? optimizeClash(
          event,
          conflictingEvent
        )
      : null;


  if (!event) {
    return (
      <main className="event-not-found">

        <p>EVENT NOT FOUND</p>

        <h1>
          We couldn't find this event.
        </h1>

        <Link
          to="/discover"
          className="back-button"
        >
          <ArrowLeft size={16} />
          Back to Discover
        </Link>

      </main>
    );
  }


  /* =========================================
     SAVE
  ========================================= */

  const handleSave = () => {
    toggleSavedEvent(event.id);

    setSaved(
      getSavedEventIds().includes(
        event.id
      )
    );
  };


  /* =========================================
     RSVP + ADD TO SCHEDULE
  ========================================= */

  const handleGoing = () => {

    /*
      If already going:
      Cancel RSVP + remove from schedule.
    */

    if (going) {

      removeRSVP(event.id);

      removeFromSchedule(
        event.id
      );

      setGoing(false);

      setRsvpCount(
        getEventRSVPCount(event.id)
      );

      setConflictingEvent(null);

      return;
    }


    /*
      Check schedule for clashes
      before confirming RSVP.
    */

    const scheduledEvents =
      getScheduledEvents();

    const clash = findTimeClash(
      event,
      scheduledEvents
    );


    /*
      Clash found.
      Don't confirm automatically.
    */

    if (clash) {
      setConflictingEvent(clash);

      return;
    }


    /*
      No clash.

      Confirm RSVP
      + add event to schedule.
    */

    addRSVP(event.id);

    addToSchedule(event);

    setGoing(true);

    setRsvpCount(
      getEventRSVPCount(event.id)
    );

    setConflictingEvent(null);
  };


  /* =========================================
     KEEP EXISTING EVENT
  ========================================= */

  const handleKeepExisting = () => {
    setConflictingEvent(null);
  };


  /* =========================================
     ADD ANYWAY
  ========================================= */

  const handleAddAnyway = () => {

    /*
      Confirm RSVP even though
      there is a schedule conflict.
    */

    addRSVP(event.id);

    addToSchedule(event);

    setGoing(true);

    setRsvpCount(
      getEventRSVPCount(event.id)
    );

    setConflictingEvent(null);
  };


  /* =========================================
     FOLLOW NOVA RECOMMENDATION
  ========================================= */

  const handleFollowRecommendation = () => {

    if (!optimizerResult) {
      return;
    }

    const recommended =
      optimizerResult.recommendedEvent;

    /*
      If NOVA recommends the current event,
      add it to the schedule.
    */

    if (recommended.id === event.id) {

      addRSVP(event.id);

      addToSchedule(event);

      setGoing(true);

      setRsvpCount(
        getEventRSVPCount(event.id)
      );

      setConflictingEvent(null);

      return;
    }

    /*
      NOVA recommends the existing event.

      In this case, keep the current schedule
      and close the clash panel.
    */

    setConflictingEvent(null);
  };


  /* =========================================
     RETURN
  ========================================= */

  return (
    <main className="event-details-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="event-details-hero">

        <Link
          to="/discover"
          className="event-back"
        >
          <ArrowLeft size={16} />
          Back to Discover
        </Link>


        <div className="event-details-top">

          <div className="event-details-category">
            {event.category}
          </div>


          <button
            className={`event-save-large ${
              saved ? "saved" : ""
            }`}
            onClick={handleSave}
            aria-label={
              saved
                ? "Remove from saved"
                : "Save event"
            }
          >

            <Heart
              size={19}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />

            {saved
              ? "Saved"
              : "Save event"}

          </button>

        </div>


        <h1>
          {event.title}
        </h1>


        <p className="event-details-description">
          {event.description}
        </p>

      </section>


      {/* =====================================
          EVENT INFORMATION
      ===================================== */}

      <section className="event-details-content">

        <div className="event-info-grid">


          {/* DATE */}

          <div className="event-info-item">

            <CalendarDays size={19} />

            <div>

              <span>Date</span>

              <strong>
                {event.date}
              </strong>

            </div>

          </div>


          {/* TIME */}

          <div className="event-info-item">

            <Clock3 size={19} />

            <div>

              <span>Time</span>

              <strong>
                {event.startTime} –{" "}
                {event.endTime}
              </strong>

            </div>

          </div>


          {/* VENUE */}

          <div className="event-info-item">

            <MapPin size={19} />

            <div>

              <span>Venue</span>

              <strong>
                {event.venue}
              </strong>

            </div>

          </div>


          {/* ATTENDANCE */}

          <div className="event-info-item">

            <Users size={19} />

            <div>

              <span>Attendance</span>

              <strong>
                {event.attendees + rsvpCount}{" "}
                people going
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================
            ATTENDANCE SECTION
        =================================== */}

        <div className="event-action-section">

          <div>

            <p className="event-action-label">
              PLAN YOUR ATTENDANCE
            </p>


            <h2>
              Are you
              <span>
                {" "}showing up?
              </span>
            </h2>


            <p>
              Add this event to your personal
              schedule. NOVA will automatically
              check it against your other events.
            </p>


            {/* =================================
                CLASH PANEL
            ================================= */}

            {conflictingEvent && (

              <div className="clash-panel">

                {/* HEADER */}

                <div className="clash-panel-header">

                  <div className="clash-panel-icon">
                    <AlertTriangle size={19} />
                  </div>


                  <div>

                    <strong>
                      Schedule conflict
                    </strong>

                    <span>
                      NOVA found an overlap
                      in your schedule.
                    </span>

                  </div>


                  <button
                    className="clash-close"
                    onClick={() =>
                      setConflictingEvent(
                        null
                      )
                    }
                    aria-label="Close conflict"
                  >
                    <X size={16} />
                  </button>

                </div>


                {/* =================================
                    NOVA RECOMMENDATION
                ================================= */}

                {optimizerResult && (

                  <div className="nova-recommendation">

                    <div className="nova-recommendation-top">

                      <div>

                        <span className="nova-recommendation-label">
                          NOVA RECOMMENDS
                        </span>

                        <strong>
                          Keep this event
                        </strong>

                      </div>


                      <div className="nova-score">

                        <span>
                          NOVA SCORE
                        </span>

                        <strong>
                          {optimizerResult.recommendedScore}
                        </strong>

                      </div>

                    </div>


                    <div className="nova-recommended-event">

                      <div className="nova-recommended-badge">
                        RECOMMENDED
                      </div>

                      <h3>
                        {
                          optimizerResult
                            .recommendedEvent
                            .title
                        }
                      </h3>


                      <div className="clash-event-meta">

                        <span>
                          <Clock3 size={13} />

                          {
                            optimizerResult
                              .recommendedEvent
                              .startTime
                          }

                          {" – "}

                          {
                            optimizerResult
                              .recommendedEvent
                              .endTime
                          }
                        </span>


                        <span>
                          <MapPin size={13} />

                          {
                            optimizerResult
                              .recommendedEvent
                              .venue
                          }
                        </span>

                      </div>

                    </div>


                    {/* WHY NOVA CHOSE IT */}

                    <div className="nova-recommendation-reason">

                      <span>
                        WHY?
                      </span>

                      <p>
                        {optimizerResult.reason}
                      </p>

                    </div>


                    {/* SCORE COMPARISON */}

                    <div className="nova-score-comparison">

                      <div>

                        <span>
                          RECOMMENDED
                        </span>

                        <strong>
                          {
                            optimizerResult
                              .recommendedScore
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          ALTERNATIVE
                        </span>

                        <strong>
                          {
                            optimizerResult
                              .alternativeScore
                          }
                        </strong>

                      </div>

                    </div>


                    {/* RECOMMENDATION ACTION */}

                    {optimizerResult.recommendedEvent.id ===
                    event.id ? (

                      <button
                        className="nova-follow-button"
                        onClick={
                          handleFollowRecommendation
                        }
                      >
                        Follow NOVA recommendation
                        <ArrowRight size={15} />
                      </button>

                    ) : (

                      <button
                        className="nova-follow-button"
                        onClick={
                          handleFollowRecommendation
                        }
                      >
                        Keep existing schedule
                        <Check size={15} />
                      </button>

                    )}

                  </div>

                )}


                {/* =================================
                    CONFLICT DETAILS
                ================================= */}

                <div className="clash-divider">

                  <span>
                    CONFLICTS WITH
                  </span>

                </div>


                {/* CURRENT EVENT */}

                <div className="clash-event">

                  <div className="clash-event-label">
                    YOU WANT TO ATTEND
                  </div>

                  <h3>
                    {event.title}
                  </h3>


                  <div className="clash-event-meta">

                    <span>
                      <Clock3 size={13} />

                      {event.startTime}
                      {" – "}
                      {event.endTime}
                    </span>


                    <span>
                      <MapPin size={13} />

                      {event.venue}
                    </span>

                  </div>

                </div>


                {/* EXISTING EVENT */}

                <div className="clash-event existing">

                  <div className="clash-event-label">
                    ALREADY ON YOUR SCHEDULE
                  </div>

                  <h3>
                    {conflictingEvent.title}
                  </h3>


                  <div className="clash-event-meta">

                    <span>

                      <Clock3 size={13} />

                      {
                        conflictingEvent.startTime
                      }

                      {" – "}

                      {
                        conflictingEvent.endTime
                      }

                    </span>


                    <span>

                      <MapPin size={13} />

                      {
                        conflictingEvent.venue
                      }

                    </span>

                  </div>

                </div>


                {/* OVERLAP */}

                <div className="clash-overlap">

                  <AlertTriangle size={15} />

                  <strong>

                    {getOverlapDuration(
                      event,
                      conflictingEvent
                    )}

                  </strong>

                  <span>
                    You can't fully attend
                    both events.
                  </span>

                </div>


                {/* ACTIONS */}

                <div className="clash-actions">

                  <button
                    className="clash-keep-button"
                    onClick={
                      handleKeepExisting
                    }
                  >
                    Keep existing
                  </button>


                  <button
                    className="clash-add-button"
                    onClick={
                      handleAddAnyway
                    }
                  >
                    Add anyway
                    <ArrowRight size={15} />
                  </button>

                </div>

              </div>

            )}

          </div>


          {/* =================================
              GOING BUTTON
          ================================= */}

          <button
            className={`going-button ${
              going ? "going" : ""
            }`}
            onClick={handleGoing}
          >

            {going ? (

              <>
                <Check size={18} />
                You're going
              </>

            ) : (

              <>
                I'm going
                <ArrowRight size={17} />
              </>

            )}

          </button>

        </div>


        {/* ===================================
            ABOUT
        =================================== */}

        <div className="event-about-section">

          <p className="event-action-label">
            ABOUT THIS EVENT
          </p>

          <h2>
            Everything you need to know.
          </h2>

          <p>
            {event.description}
          </p>

        </div>

      </section>

    </main>
  );
}

export default EventDetails;