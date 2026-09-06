import {
  ArrowUp,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

import { events } from "../data/events";
import {
  getCopilotEvents,
  type CopilotResult,
} from "../utils/copilot";

function CampusCopilot() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] =
    useState<CopilotResult | null>(null);

  const handleSubmit = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    const response = getCopilotEvents(
      events,
      trimmedQuery
    );

    setResult(response);
    setQuery("");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      {/* =========================================
          FLOATING COPILOT BUTTON
      ========================================= */}

      {!open && (
        <button
          className="campus-copilot-trigger"
          onClick={() => setOpen(true)}
          aria-label="Open NOVA Campus Copilot"
        >
          <Sparkles size={18} />

          <span>
            NOVA
          </span>
        </button>
      )}


      {/* =========================================
          COPILOT PANEL
      ========================================= */}

      {open && (
        <div className="campus-copilot">

          <div className="campus-copilot-panel">

            {/* Header */}

            <div className="campus-copilot-header">

              <div className="campus-copilot-brand">

                <div className="campus-copilot-icon">
                  <Sparkles size={16} />
                </div>

                <div>
                  <strong>
                    NOVA COPILOT
                  </strong>

                  <span>
                    Your campus assistant
                  </span>
                </div>

              </div>

              <button
                className="campus-copilot-close"
                onClick={() => setOpen(false)}
                aria-label="Close NOVA Campus Copilot"
              >
                <X size={17} />
              </button>

            </div>


            {/* Body */}

            <div className="campus-copilot-body">

              {!result ? (
                <div className="campus-copilot-welcome">

                  <div className="copilot-welcome-icon">
                    <Sparkles size={22} />
                  </div>

                  <p className="section-label">
                    NOVA SMART
                  </p>

                  <h2>
                    What are you
                    looking for?
                  </h2>

                  <p>
                    Ask me about events,
                    categories, popular
                    activities, or what's
                    happening this week.
                  </p>

                  <div className="copilot-suggestions">

                    <button
                      onClick={() =>
                        setQuery(
                          "Show me technology events"
                        )
                      }
                    >
                      Technology events
                    </button>

                    <button
                      onClick={() =>
                        setQuery(
                          "Show me popular events"
                        )
                      }
                    >
                      Popular events
                    </button>

                    <button
                      onClick={() =>
                        setQuery(
                          "What events are happening this week?"
                        )
                      }
                    >
                      This week's events
                    </button>

                  </div>

                </div>
              ) : (
                <div className="campus-copilot-result">

                  <div className="copilot-answer">

                    <span className="copilot-answer-label">
                      NOVA
                    </span>

                    <p>
                      {result.message}
                    </p>

                  </div>


                  {result.events.length > 0 && (
                    <div className="copilot-events">

                      {result.events.map(
                        (event) => (
                          <a
                            key={event.id}
                            href={`/event/${event.id}`}
                            className="copilot-event"
                          >

                            <div className="copilot-event-category">
                              {event.category}
                            </div>

                            <div className="copilot-event-content">

                              <h3>
                                {event.title}
                              </h3>

                              <p>
                                {event.date}
                                {" · "}
                                {event.startTime}
                              </p>

                            </div>

                            <span className="copilot-event-arrow">
                              →
                            </span>

                          </a>
                        )
                      )}

                    </div>
                  )}


                  <button
                    className="copilot-new-search"
                    onClick={() => {
                      setResult(null);
                      setQuery("");
                    }}
                  >
                    Ask something else
                  </button>

                </div>
              )}

            </div>


            {/* Input */}

            <div className="campus-copilot-input">

              <input
                type="text"
                placeholder="Ask NOVA anything about campus events..."
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                onKeyDown={handleKeyDown}
              />

              <button
                onClick={handleSubmit}
                disabled={!query.trim()}
                aria-label="Ask NOVA"
              >
                <ArrowUp size={16} />
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default CampusCopilot;