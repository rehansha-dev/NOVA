import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Save,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const categories = [
  "Technology",
  "Business",
  "Cultural",
  "Sports",
  "Academic",
  "Clubs",
];

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [attendees, setAttendees] = useState("");
  const [description, setDescription] = useState("");

  const [eventFound, setEventFound] = useState(true);

  // =========================================
  // LOAD EVENT
  // =========================================

  useEffect(() => {
    const storedEvents =
      localStorage.getItem("nova-events");

    if (!storedEvents) {
      setEventFound(false);
      return;
    }

    try {
      const existingEvents = JSON.parse(
        storedEvents
      );

      const event = existingEvents.find(
        (item: any) =>
          String(item.id) === String(id)
      );

      if (!event) {
        setEventFound(false);
        return;
      }

      setTitle(event.title || "");
      setCategory(
        event.category || "Technology"
      );
      setDate(event.date || "");
      setStartTime(event.startTime || "");
      setEndTime(event.endTime || "");
      setVenue(event.venue || "");
      setAttendees(
        String(event.attendees || "")
      );
      setDescription(
        event.description || ""
      );
    } catch {
      setEventFound(false);
    }
  }, [id]);

  // =========================================
  // SAVE CHANGES
  // =========================================

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !venue ||
      !description
    ) {
      return;
    }

    const storedEvents =
      localStorage.getItem("nova-events");

    if (!storedEvents) {
      return;
    }

    try {
      const existingEvents = JSON.parse(
        storedEvents
      );

      const updatedEvents =
        existingEvents.map((event: any) => {
          if (
            String(event.id) !== String(id)
          ) {
            return event;
          }

          return {
            ...event,
            title,
            category,
            date,
            startTime,
            endTime,
            venue,
            attendees:
              Number(attendees) || 0,
            description,
          };
        });

      localStorage.setItem(
        "nova-events",
        JSON.stringify(updatedEvents)
      );

      navigate("/organizer");
    } catch {
      console.error(
        "Unable to update event."
      );
    }
  };

  // =========================================
  // EVENT NOT FOUND
  // =========================================

  if (!eventFound) {
    return (
      <main className="create-event-page">
        <section className="create-event-header">

          <Link
            to="/organizer"
            className="create-back"
          >
            <ArrowLeft size={16} />
            Back to Organizer
          </Link>

          <p className="section-label">
            EVENT NOT FOUND
          </p>

          <h1>
            This event
            <span> doesn't exist.</span>
          </h1>

          <p>
            The event may have been deleted or is
            no longer available.
          </p>

        </section>
      </main>
    );
  }

  return (
    <main className="create-event-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <section className="create-event-header">

        <Link
          to="/organizer"
          className="create-back"
        >
          <ArrowLeft size={16} />
          Back to Organizer
        </Link>

        <p className="section-label">
          EDIT EVENT
        </p>

        <h1>
          Update your
          <span> campus event.</span>
        </h1>

        <p>
          Make changes to your event and keep
          students up to date.
        </p>

      </section>


      {/* =========================================
          FORM
      ========================================= */}

      <section className="create-event-content">

        <form
          className="create-event-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC INFO */}

          <div className="form-section">

            <p className="form-section-label">
              BASIC INFO
            </p>

            <div className="form-field">

              <label>
                Event name
              </label>

              <input
                type="text"
                placeholder="e.g. AI & Machine Learning Workshop"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

            </div>


            <div className="form-field">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

            </div>


            <div className="form-field">

              <label>
                Description
              </label>

              <textarea
                placeholder="Tell students what this event is about..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={5}
                required
              />

            </div>

          </div>


          {/* WHEN & WHERE */}

          <div className="form-section">

            <p className="form-section-label">
              WHEN & WHERE
            </p>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  <CalendarDays size={14} />
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  <Clock3 size={14} />
                  Start time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  <Clock3 size={14} />
                  End time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  <MapPin size={14} />
                  Venue
                </label>

                <input
                  type="text"
                  placeholder="e.g. Innovation Hub"
                  value={venue}
                  onChange={(e) =>
                    setVenue(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

          </div>


          {/* EVENT CAPACITY */}

          <div className="form-section">

            <p className="form-section-label">
              EVENT CAPACITY
            </p>

            <div className="form-field">

              <label>
                <Users size={14} />
                Expected attendees
              </label>

              <input
                type="number"
                min="0"
                placeholder="e.g. 150"
                value={attendees}
                onChange={(e) =>
                  setAttendees(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* FOOTER */}

          <div className="create-event-footer">

            <Link
              to="/organizer"
              className="cancel-event-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="publish-event-button"
            >
              <Save size={16} />
              Save Changes
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}

export default EditEvent;