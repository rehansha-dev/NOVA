import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  extractEventFromPoster,
  type PosterExtractionResult,
} from "../utils/posterExtraction";

const categories = [
  "Technology",
  "Business",
  "Cultural",
  "Sports",
  "Academic",
  "Clubs",
];

function CreateEvent() {
  const navigate = useNavigate();

  // =========================================
  // FORM STATE
  // =========================================

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState("Technology");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [venue, setVenue] =
    useState("");

  const [attendees, setAttendees] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  // =========================================
  // POSTER STATE
  // =========================================

  const [poster, setPoster] =
    useState<string | null>(null);

  const [posterName, setPosterName] =
    useState("");

  // OCR state
  const [isExtracting, setIsExtracting] =
    useState(false);

  const [ocrProgress, setOcrProgress] =
    useState(0);

  const [extractionResult, setExtractionResult] =
    useState<PosterExtractionResult | null>(
      null
    );


  // =========================================
  // POSTER UPLOAD
  // =========================================

  const handlePosterUpload = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    // Image validation
    if (!file.type.startsWith("image/")) {
      setError(
        "Please upload an image file."
      );

      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Poster image must be smaller than 5MB."
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const imageData =
        reader.result as string;

      setPoster(imageData);
      setPosterName(file.name);

      // Reset previous extraction
      setExtractionResult(null);
      setOcrProgress(0);
      setIsExtracting(true);

      try {
        const result =
          await extractEventFromPoster(
            imageData,
            (progress) => {
              setOcrProgress(progress);
            }
          );

        setExtractionResult(result);

        if (!result.extracted) {
          setError(
            "NOVA couldn't confidently extract event details. Please enter them manually."
          );
        }
      } catch (err) {
        console.error(
          "Poster extraction failed:",
          err
        );

        setError(
          "NOVA couldn't read this poster. Please enter the details manually."
        );
      } finally {
        setIsExtracting(false);
      }
    };

    reader.readAsDataURL(file);
  };


  // =========================================
  // APPLY EXTRACTED DATA
  // =========================================

  const handleApplyExtraction = () => {
    if (!extractionResult) return;

    if (extractionResult.title) {
      setTitle(
        extractionResult.title
      );
    }

    if (extractionResult.category) {
      setCategory(
        extractionResult.category
      );
    }

    if (extractionResult.date) {
      setDate(
        extractionResult.date
      );
    }

    if (extractionResult.startTime) {
      setStartTime(
        extractionResult.startTime
      );
    }

    if (extractionResult.endTime) {
      setEndTime(
        extractionResult.endTime
      );
    }

    if (extractionResult.venue) {
      setVenue(
        extractionResult.venue
      );
    }

    if (extractionResult.attendees) {
      setAttendees(
        extractionResult.attendees
      );
    }

    if (extractionResult.description) {
      setDescription(
        extractionResult.description
      );
    }

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =========================================
  // REMOVE POSTER
  // =========================================

  const handleRemovePoster = () => {
    setPoster(null);
    setPosterName("");
    setExtractionResult(null);
    setOcrProgress(0);
    setIsExtracting(false);
  };


  // =========================================
  // CREATE EVENT
  // =========================================

  const handleSubmit = (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");


    // Required fields
    if (
      !title.trim() ||
      !date ||
      !startTime ||
      !endTime ||
      !venue.trim() ||
      !description.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }


    // Same time validation
    if (startTime === endTime) {
      setError(
        "Start time and end time cannot be the same."
      );

      return;
    }


    // =========================================
    // NEW EVENT
    // =========================================

    const newEvent = {
      id: Date.now(),

      title: title.trim(),

      category,

      date,

      startTime,

      endTime,

      venue: venue.trim(),

      attendees:
        Number(attendees) || 0,

      description:
        description.trim(),
    };


    // =========================================
    // SAVE EVENT
    // =========================================

    try {
      const storedEvents =
        localStorage.getItem(
          "nova-events"
        );

      let existingEvents:
        typeof newEvent[] = [];


      if (storedEvents) {
        try {
          const parsed =
            JSON.parse(
              storedEvents
            );

          if (
            Array.isArray(parsed)
          ) {
            existingEvents =
              parsed;
          }

        } catch {
          existingEvents = [];
        }
      }


      const updatedEvents = [
        ...existingEvents,
        newEvent,
      ];


      localStorage.setItem(
        "nova-events",
        JSON.stringify(
          updatedEvents
        )
      );


      // Navigate to organizer
      navigate("/organizer");

    } catch {
      setError(
        "Unable to create the event. Please try again."
      );
    }
  };


  // =========================================
  // UI
  // =========================================

  return (
    <main className="create-event-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <section className="create-event-header">

        <Link
          to="/organizer"
          className="create-back"
        >
          <ArrowLeft size={16} />
          Back to Organizer
        </Link>


        <p className="section-label">
          CREATE EVENT
        </p>


        <h1>
          Create your
          <span>
            {" "}campus event.
          </span>
        </h1>


        <p>
          Publish an event and help students
          discover what's happening on campus.
        </p>

      </section>



      {/* =====================================
          FORM
      ===================================== */}

      <section className="create-event-content">

        <form
          className="create-event-form"
          onSubmit={handleSubmit}
        >


          {/* =================================
              ERROR
          ================================= */}

          {error && (
            <div className="create-event-error">
              {error}
            </div>
          )}



          {/* =================================
              NOVA AI POSTER
          ================================= */}

          <div className="form-section poster-upload-section">

            <p className="form-section-label">
              NOVA AI
            </p>


            <div className="poster-upload-header">

              <div>

                <h3>
                  Create from event poster
                </h3>

                <p>
                  Upload a campus event poster.
                  NOVA will read the poster and
                  extract event details automatically.
                </p>

              </div>


              <div className="poster-upload-icon">

                <Sparkles size={18} />

              </div>

            </div>



            {/* =================================
                UPLOAD
            ================================= */}

            {!poster && (

              <label
                className="poster-upload-box"
              >

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePosterUpload
                  }
                  hidden
                />


                <div className="poster-upload-content">

                  <div className="poster-upload-circle">

                    <ImagePlus
                      size={22}
                    />

                  </div>


                  <strong>
                    Upload event poster
                  </strong>


                  <span>
                    PNG, JPG or WEBP · Max 5MB
                  </span>

                </div>

              </label>

            )}



            {/* =================================
                POSTER PREVIEW
            ================================= */}

            {poster && (

              <div className="poster-preview">

                <img
                  src={poster}
                  alt="Uploaded event poster"
                />


                <div className="poster-preview-footer">

                  <div>

                    <strong>
                      {posterName}
                    </strong>

                    <span>
                      Poster uploaded successfully
                    </span>

                  </div>


                  <button
                    type="button"
                    className="poster-remove-button"
                    onClick={
                      handleRemovePoster
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            )}



            {/* =================================
                OCR PROCESSING
            ================================= */}

            {isExtracting && (

              <div className="poster-ai-processing">

                <div className="poster-ai-processing-icon">

                  <Loader2
                    size={17}
                    className="poster-loader"
                  />

                </div>


                <div className="poster-ai-processing-content">

                  <strong>
                    NOVA is reading your poster...
                  </strong>

                  <span>
                    Extracting event information
                  </span>


                  <div className="poster-progress">

                    <div
                      className="poster-progress-bar"
                      style={{
                        width: `${ocrProgress}%`,
                      }}
                    />

                  </div>


                  <small>
                    {ocrProgress}%
                  </small>

                </div>

              </div>

            )}



            {/* =================================
                EXTRACTION RESULT
            ================================= */}

            {!isExtracting &&
              extractionResult &&
              extractionResult.extracted && (

                <div className="poster-ai-result">

                  <div className="poster-ai-result-header">

                    <div>

                      <div className="poster-ai-result-title">

                        <CheckCircle2
                          size={16}
                        />

                        NOVA extracted event details

                      </div>

                      <span>
                        Review the information before applying it.
                      </span>

                    </div>


                    <div className="poster-confidence">

                      {extractionResult.confidence}% confidence

                    </div>

                  </div>


                  <div className="poster-extracted-fields">

                    {extractionResult.title && (
                      <div>
                        <span>EVENT</span>
                        <strong>
                          {extractionResult.title}
                        </strong>
                      </div>
                    )}


                    {extractionResult.date && (
                      <div>
                        <span>DATE</span>
                        <strong>
                          {extractionResult.date}
                        </strong>
                      </div>
                    )}


                    {(extractionResult.startTime ||
                      extractionResult.endTime) && (

                      <div>
                        <span>TIME</span>
                        <strong>
                          {extractionResult.startTime ||
                            "--:--"}
                          {" — "}
                          {extractionResult.endTime ||
                            "--:--"}
                        </strong>
                      </div>

                    )}


                    {extractionResult.venue && (
                      <div>
                        <span>VENUE</span>
                        <strong>
                          {extractionResult.venue}
                        </strong>
                      </div>
                    )}


                    <div>
                      <span>CATEGORY</span>
                      <strong>
                        {extractionResult.category}
                      </strong>
                    </div>

                  </div>


                  <button
                    type="button"
                    className="poster-apply-button"
                    onClick={
                      handleApplyExtraction
                    }
                  >
                    <Sparkles size={15} />
                    Apply to Event Form
                  </button>

                </div>

              )}

          </div>



          {/* =====================================
              BASIC INFO
          ===================================== */}

          <div className="form-section">

            <p className="form-section-label">
              BASIC INFO
            </p>


            {/* EVENT NAME */}

            <div className="form-field">

              <label>
                Event name
              </label>


              <input
                type="text"
                placeholder="e.g. AI & Machine Learning Workshop"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                required
              />

            </div>



            {/* CATEGORY */}

            <div className="form-field">

              <label>
                Category
              </label>


              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >

                {categories.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )}

              </select>

            </div>



            {/* DESCRIPTION */}

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



          {/* =====================================
              WHEN & WHERE
          ===================================== */}

          <div className="form-section">

            <p className="form-section-label">
              WHEN & WHERE
            </p>


            <div className="form-grid">


              {/* DATE */}

              <div className="form-field">

                <label>

                  <CalendarDays
                    size={14}
                  />

                  Date

                </label>


                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  required
                />

              </div>



              {/* START TIME */}

              <div className="form-field">

                <label>

                  <Clock3
                    size={14}
                  />

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



              {/* END TIME */}

              <div className="form-field">

                <label>

                  <Clock3
                    size={14}
                  />

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



              {/* VENUE */}

              <div className="form-field">

                <label>

                  <MapPin
                    size={14}
                  />

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



          {/* =====================================
              CAPACITY
          ===================================== */}

          <div className="form-section">

            <p className="form-section-label">
              EVENT CAPACITY
            </p>


            <div className="form-field">

              <label>

                <Users
                  size={14}
                />

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



          {/* =====================================
              FOOTER
          ===================================== */}

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

              <Plus size={16} />

              Create Event

            </button>

          </div>

        </form>

      </section>

    </main>
  );
}

export default CreateEvent;