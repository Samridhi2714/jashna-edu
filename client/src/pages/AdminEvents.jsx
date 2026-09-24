import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import eventImages from "../data/eventImages";

import {
  CalendarDays,
  ChevronDown,
  Edit3,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  /* =========================================================
     GET EVENT IMAGE
  ========================================================= */

  const getEventImage = (event) => {
    // 1. New events with Cloudinary image
    if (event?.image) {
      return event.image;
    }

    // 2. Existing historical events with local images
    if (event?.eventNumber && eventImages[event.eventNumber]) {
      return eventImages[event.eventNumber][0];
    }

    // 3. No image
    return "";
  };

  /* =========================================================
     HANDLE AUTH FAILURE
  ========================================================= */

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    navigate("/admin/login");
  };

  /* =========================================================
     FETCH EVENTS
  ========================================================= */

  const fetchEvents = async (showRefreshLoader = false) => {
    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/events/admin/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch events.");
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH EVENTS ERROR:", error);

      setError(error.message || "Unable to load events.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchEvents();
  }, []);

  /* =========================================================
     DELETE EVENT
  ========================================================= */

  const handleDelete = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventTitle}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event.");
      }

      // Immediately remove deleted event
      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== eventId),
      );
    } catch (error) {
      console.error("DELETE EVENT ERROR:", error);

      setError(error.message || "Unable to delete event.");
    }
  };

  /* =========================================================
     FORMAT EVENT DATE
  ========================================================= */

  const formatDate = (date, precision = "exact") => {
    if (!date) {
      return "Date not available";
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      return "Date not available";
    }

    if (precision === "year") {
      return eventDate.getFullYear().toString();
    }

    if (precision === "month") {
      return eventDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }

    return eventDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /* =========================================================
     AVAILABLE YEARS
  ========================================================= */

  const years = useMemo(() => {
    const uniqueYears = [
      ...new Set(
        events
          .filter((event) => event.date)
          .map((event) => new Date(event.date).getFullYear()),
      ),
    ];

    return uniqueYears.sort((a, b) => b - a);
  }, [events]);

  /* =========================================================
     FILTER EVENTS
  ========================================================= */

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.category?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      const eventYear = event.date
        ? new Date(event.date).getFullYear().toString()
        : "";

      const matchesYear = yearFilter === "all" || eventYear === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [events, searchTerm, statusFilter, yearFilter]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalEvents = events.length;

  const publishedEvents = events.filter(
    (event) => event.status === "published",
  ).length;

  const draftEvents = events.filter((event) => event.status === "draft").length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-jashna-gold">
            Content Management
          </p>

          <h1 className="mt-2 font-display text-3xl text-jashna-maroon-dark sm:text-[36px]">
            Events
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-jashna-muted">
            Manage Jashna Edu events, training sessions, workshops and
            institutional activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/events/new")}
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-xl
            bg-jashna-maroon
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-jashna-maroon-dark
          "
        >
          <Plus size={17} />
          Add New Event
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total */}

        <div className="rounded-2xl border border-jashna-stone bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-jashna-muted">Total Events</p>

              <p className="mt-1 text-3xl font-bold text-jashna-maroon-dark">
                {totalEvents}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-jashna-maroon/10 text-jashna-maroon">
              <CalendarDays size={20} />
            </div>
          </div>
        </div>

        {/* Published */}

        <div className="rounded-2xl border border-jashna-stone bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-jashna-muted">Published</p>

              <p className="mt-1 text-3xl font-bold text-jashna-maroon-dark">
                {publishedEvents}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Drafts */}

        <div className="rounded-2xl border border-jashna-stone bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-jashna-muted">Drafts</p>

              <p className="mt-1 text-3xl font-bold text-jashna-maroon-dark">
                {draftEvents}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-jashna-gold/10 text-jashna-gold">
              <FileText size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mb-7 rounded-2xl border border-jashna-stone bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-jashna-muted"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search events..."
              className="
                w-full
                rounded-xl
                border
                border-jashna-stone
                bg-jashna-ivory/40
                py-3
                pl-11
                pr-4
                text-sm
                outline-none
                transition
                focus:border-jashna-maroon
                focus:ring-2
                focus:ring-jashna-maroon/10
              "
            />
          </div>

          {/* Status */}

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="
                w-full
                appearance-none
                rounded-xl
                border
                border-jashna-stone
                bg-jashna-ivory/40
                py-3
                pl-4
                pr-10
                text-sm
                outline-none
                transition
                focus:border-jashna-maroon
                focus:ring-2
                focus:ring-jashna-maroon/10
                lg:w-44
              "
            >
              <option value="all">All Status</option>

              <option value="published">Published</option>

              <option value="draft">Draft</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-jashna-muted"
            />
          </div>

          {/* Year */}

          <div className="relative">
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="
                w-full
                appearance-none
                rounded-xl
                border
                border-jashna-stone
                bg-jashna-ivory/40
                py-3
                pl-4
                pr-10
                text-sm
                outline-none
                transition
                focus:border-jashna-maroon
                focus:ring-2
                focus:ring-jashna-maroon/10
                lg:w-36
              "
            >
              <option value="all">All Years</option>

              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-jashna-muted"
            />
          </div>

          {/* Refresh */}

          <button
            type="button"
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-jashna-stone
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              transition
              hover:border-jashna-maroon
              hover:text-jashna-maroon
              disabled:opacity-60
            "
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* =====================================================
          RESULTS COUNT
      ===================================================== */}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-jashna-muted">
          Showing{" "}
          <span className="font-semibold text-jashna-charcoal">
            {filteredEvents.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-jashna-charcoal">
            {events.length}
          </span>{" "}
          events
        </p>
      </div>

      {/* =====================================================
          EVENTS
      ===================================================== */}

      {loading ? (
        <div className="rounded-2xl border border-jashna-stone bg-white p-12 text-center shadow-sm">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-jashna-maroon"
          />

          <p className="mt-4 text-sm text-jashna-muted">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-jashna-stone bg-white p-12 text-center">
          <CalendarDays size={36} className="mx-auto text-jashna-muted" />

          <h3 className="mt-4 font-display text-2xl text-jashna-maroon-dark">
            No matching events
          </h3>

          <p className="mt-2 text-sm text-jashna-muted">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const eventImage = getEventImage(event);

            return (
              <article
                key={event._id}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-jashna-stone
                  bg-white
                  shadow-sm
                "
              >
                <div className="flex flex-col xl:flex-row">
                  {/* IMAGE */}

                  <div className="shrink-0 xl:w-64">
                    {eventImage ? (
                      <img
                        src={eventImage}
                        alt={event.title || "Jashna Edu event"}
                        className="
                          h-52
                          w-full
                          object-cover
                          xl:h-full
                          xl:min-h-[210px]
                        "
                      />
                    ) : (
                      <div className="flex h-52 min-h-[210px] w-full items-center justify-center bg-jashna-maroon-dark xl:h-full">
                        <div className="px-5 text-center text-white/70">
                          <CalendarDays size={32} className="mx-auto mb-3" />

                          <p className="text-xs uppercase tracking-widest">
                            Jashna Edu
                          </p>

                          <p className="mt-1 text-xs">No image</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}

                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        {/* Category */}

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-jashna-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-jashna-gold">
                            {event.category || "Event"}
                          </span>

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              ${
                                event.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }
                            `}
                          >
                            {event.status}
                          </span>
                        </div>

                        {/* Title */}

                        <h3 className="font-display text-2xl text-jashna-maroon-dark sm:text-3xl">
                          {event.title}
                        </h3>
                      </div>

                      {/* Date */}

                      <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-jashna-maroon">
                        <CalendarDays size={17} />

                        {formatDate(event.date, event.datePrecision)}
                      </div>
                    </div>

                    {/* Location */}

                    {event.location && (
                      <div className="mt-4 flex items-start gap-2 text-sm text-jashna-muted">
                        <MapPin size={17} className="mt-0.5 shrink-0" />

                        <span>{event.location}</span>
                      </div>
                    )}

                    {/* Description */}

                    {event.description && (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-jashna-muted">
                        {event.description}
                      </p>
                    )}

                    {/* Actions */}

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-jashna-stone pt-5">
                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/events/edit/${event._id}`)
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-jashna-stone
                          bg-white
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-jashna-charcoal
                          transition
                          hover:border-jashna-maroon
                          hover:text-jashna-maroon
                        "
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => handleDelete(event._id, event.title)}
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-red-600
                          transition
                          hover:border-red-300
                          hover:bg-red-100
                        "
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminEvents;
