import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { events, type Event } from "../data/events";
import {
  getSavedEventIds,
  toggleSavedEvent,
} from "../utils/savedEvents";
import { getRecommendedEvents } from "../utils/eventRecommendations";

const categories = [
  "All",
  "Technology",
  "Business",
  "Cultural",
  "Sports",
  "Academic",
  "Clubs",
];

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

function Discover() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [savedEvents, setSavedEvents] = useState<number[]>(
    () => getSavedEventIds()
  );

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  const allEvents = useMemo(() => {
    return getAllEvents();
  }, []);

  /*
   * NOVA SMART
   * Generates personalized event recommendations
   * using the user's RSVP activity and event data.
   */
  const recommendations = useMemo(() => {
    return getRecommendedEvents(allEvents, 3);
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    const results = allEvents.filter((event) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        searchText === "" ||
        event.title.toLowerCase().includes(searchText) ||
        event.description.toLowerCase().includes(searchText) ||
        event.venue.toLowerCase().includes(searchText) ||
        event.category.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        event.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "popular") {
      return [...results].sort(
        (a, b) => b.attendees - a.attendees
      );
    }

    if (sortBy === "title") {
      return [...results].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (sortBy === "recommended") {
      return [...results].sort((a, b) => {
        const aRecommendation = recommendations.find(
          (item) => item.event.id === a.id
        );

        const bRecommendation = recommendations.find(
          (item) => item.event.id === b.id
        );

        return (
          (bRecommendation?.score ?? 0) -
          (aRecommendation?.score ?? 0)
        );
      });
    }

    return results;
  }, [
    allEvents,
    search,
    category,
    sortBy,
    recommendations,
  ]);

  const toggleSave = (id: number) => {
    toggleSavedEvent(id);

    setSavedEvents(getSavedEventIds());
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("recommended");
  };

  const hasActiveFilters =
    search !== "" ||
    category !== "All" ||
    sortBy !== "recommended";

  return (
    <main className="discover-page">

      {/* =====================================================
          DISCOVER HEADER
      ===================================================== */}

      <section className="discover-header">
        <div className="discover-header-content">
          <p className="section-label">
            DISCOVER
          </p>

          <h1>
            Find something
            <span>
              worth showing up for.
            </span>
          </h1>

          <p className="discover-subtitle">
            Explore workshops, competitions, meetups,
            cultural events, and everything happening
            around campus.
          </p>
        </div>

        <div className="discover-ai">
          <Sparkles size={16} />

          <div>
            <strong>NOVA SMART</strong>

            <span>
              Personalized discovery
            </span>
          </div>
        </div>
      </section>


      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <section className="discover-controls">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search events, clubs, workshops..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          className={`filter-button ${
            showFilters ? "active" : ""
          }`}
          onClick={() =>
            setShowFilters((current) => !current)
          }
        >
          <SlidersHorizontal size={16} />

          Filters

          {hasActiveFilters && (
            <span className="filter-dot" />
          )}
        </button>
      </section>


      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

      {showFilters && (
        <section className="filter-panel">

          <div className="filter-panel-header">

            <div>
              <p className="section-label">
                REFINE
              </p>

              <h3>
                Customize your discovery
              </h3>
            </div>

            {hasActiveFilters && (
              <button
                className="clear-filter-button"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}

          </div>

          <div className="filter-options">

            <div className="filter-group">

              <span>
                Sort by
              </span>

              <div className="sort-options">

                <button
                  className={
                    sortBy === "recommended"
                      ? "sort-option active"
                      : "sort-option"
                  }
                  onClick={() =>
                    setSortBy("recommended")
                  }
                >
                  Recommended
                </button>

                <button
                  className={
                    sortBy === "popular"
                      ? "sort-option active"
                      : "sort-option"
                  }
                  onClick={() =>
                    setSortBy("popular")
                  }
                >
                  Most popular
                </button>

                <button
                  className={
                    sortBy === "title"
                      ? "sort-option active"
                      : "sort-option"
                  }
                  onClick={() =>
                    setSortBy("title")
                  }
                >
                  A–Z
                </button>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <div className="category-row">

        {categories.map((item) => (
          <button
            key={item}
            className={
              category === item
                ? "category-button active"
                : "category-button"
            }
            onClick={() =>
              setCategory(item)
            }
          >
            {item}
          </button>
        ))}

      </div>


      {/* =====================================================
          NOVA SMART — PERSONALIZED RECOMMENDATIONS
      ===================================================== */}

      {recommendations.length > 0 && (
        <section className="nova-smart-section">

          <div className="nova-smart-header">

            <div>

              <p className="section-label">
                NOVA SMART
              </p>

              <h2>
                Picked for you.
              </h2>

              <p>
                Based on your activity and event
                interests, NOVA found a few events
                worth checking out.
              </p>

            </div>

            <div className="nova-smart-icon">
              <Sparkles size={18} />
            </div>

          </div>


          <div className="nova-smart-grid">

            {recommendations.map(
              ({ event, reason }) => (

                <div
                  className="nova-smart-card"
                  key={event.id}
                >

                  <div className="nova-smart-card-top">

                    <span>
                      {event.category}
                    </span>

                    <Sparkles size={13} />

                  </div>


                  <h3>
                    {event.title}
                  </h3>


                  <p className="nova-smart-reason">
                    {reason}
                  </p>


                  <div className="nova-smart-meta">

                    <span>
                      {event.date}
                    </span>

                    <span>
                      ·
                    </span>

                    <span>
                      {event.startTime}
                    </span>

                  </div>


                  <div className="nova-smart-action">

                    <a
                      href={`/event/${event.id}`}
                    >
                      View event →
                    </a>

                  </div>

                </div>

              )
            )}

          </div>

        </section>
      )}


      {/* =====================================================
          EVENT RESULTS
      ===================================================== */}

      <section className="discover-results">

        <div className="results-header">

          <div>

            <p className="section-label">
              EVENTS
            </p>

            <h2>
              {search
                ? `Results for "${search}"`
                : category === "All"
                  ? "Happening on campus"
                  : `${category} events`}
            </h2>

          </div>


          <div className="results-meta">

            <span className="result-count">

              {filteredEvents.length}{" "}

              {filteredEvents.length === 1
                ? "event"
                : "events"}

            </span>


            {hasActiveFilters && (
              <button
                className="results-clear"
                onClick={clearFilters}
              >
                Clear
              </button>
            )}

          </div>

        </div>


        {/* =====================================================
            EVENT GRID
        ===================================================== */}

        {filteredEvents.length > 0 ? (

          <div className="discover-grid">

            {filteredEvents.map((event) => (

              <EventCard
                key={event.id}
                event={event}
                saved={savedEvents.includes(
                  event.id
                )}
                onSave={toggleSave}
              />

            ))}

          </div>

        ) : (

          <div className="empty-results">

            <div className="empty-icon">
              <Search size={25} />
            </div>

            <h3>
              No events found
            </h3>

            <p>
              We couldn't find anything matching
              your current search or filters.
            </p>

            <button
              onClick={clearFilters}
            >
              Clear filters
            </button>

          </div>

        )}

      </section>

    </main>
  );
}

export default Discover;