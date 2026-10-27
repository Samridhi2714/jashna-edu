import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

const FONT_FAMILY = '"Times New Roman", Times, serif';

const selectClass =
  "w-full appearance-none rounded-xl border-[3px] border-[#D9E2EF] bg-white py-4 pl-5 pr-11 text-[18px] font-bold text-[#3B0A1E] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B] hover:shadow-md focus:-translate-y-0.5 focus:border-[#9F1239] focus:shadow-lg focus:ring-4 focus:ring-[#9F1239]/15";

/* ----------------------------- STAT CARD ----------------------------- */

function StatCard({ label, value, Icon, gradient, shadow }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative cursor-default overflow-hidden rounded-3xl p-6 text-white"
      style={{ background: gradient, boxShadow: `0 16px 36px ${shadow}` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
      <div className="pointer-events-none absolute -bottom-10 right-12 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-[16px] font-extrabold uppercase tracking-[0.1em] text-white/90">
            {label}
          </p>

          <motion.p
            key={value}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 text-6xl font-extrabold leading-none"
          >
            {value}
          </motion.p>
        </div>

        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 backdrop-blur">
          <Icon size={30} />
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------ MAIN PAGE ------------------------------ */

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
    <div
      className="admin-events-root mx-auto max-w-7xl pb-14"
      style={{ fontFamily: FONT_FAMILY }}
    >
      {/* Force Times New Roman everywhere + custom animations */}
      <style>{`
        .admin-events-root, .admin-events-root * { font-family: ${FONT_FAMILY} !important; }
        @keyframes ae-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes ae-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .ae-hero { background: linear-gradient(120deg, #4A0D24, #7F1D3D, #9F1239, #B45309, #4A0D24); background-size: 300% 300%; animation: ae-gradient 14s ease infinite; }
        .ae-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); transform: translateX(-120%); animation: ae-shimmer 2.8s ease-in-out infinite; }
      `}</style>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ae-hero relative isolate mb-8 overflow-hidden rounded-[32px] border-[3px] border-[#C2410C]/40 px-7 py-10 text-white shadow-[0_28px_70px_rgba(74,13,36,0.35)] sm:px-10 sm:py-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[46px] border-[#FBBF24]/20"
        />
        <div className="pointer-events-none absolute -bottom-28 left-[35%] h-72 w-72 rounded-full bg-[#F472B6]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#FBBF24]/25 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#FBBF24]/50 bg-[#FBBF24]/15 px-5 py-2.5 text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#FDE68A]"
            >
              <Sparkles size={19} />
              Content Management
            </motion.div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Manage{" "}
              <span className="bg-gradient-to-r from-[#FDE68A] via-[#FBCFE8] to-[#BAE6FD] bg-clip-text text-transparent">
                Events
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-[20px] font-semibold leading-8 text-white/85">
              Manage Jashna Edu events, training sessions, workshops and
              institutional activities.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => navigate("/admin/events/new")}
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.92 }}
            className="ae-shimmer relative inline-flex w-fit shrink-0 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FBBF24] to-[#FB923C] px-9 py-5 text-[20px] font-extrabold text-[#4A0D24] shadow-[0_14px_34px_rgba(251,191,36,0.5)] transition-shadow hover:shadow-[0_20px_44px_rgba(251,191,36,0.7)]"
          >
            <Plus size={26} strokeWidth={3.2} />
            Add New Event
          </motion.button>
        </div>
      </motion.section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="mb-7 flex items-start gap-4 rounded-2xl border-[3px] border-[#FDA4AF] bg-gradient-to-r from-[#FFE4E6] to-[#FFF1F2] p-5 text-[#9F1239] shadow-lg"
          >
            <X size={28} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[19px] font-extrabold">{error}</p>
            <motion.button
              type="button"
              whileHover={{ rotate: 90, scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Total Events"
          value={totalEvents}
          Icon={CalendarDays}
          gradient="linear-gradient(135deg, #9F1239, #E11D48)"
          shadow="rgba(159,18,57,0.35)"
        />

        <StatCard
          label="Published"
          value={publishedEvents}
          Icon={Users}
          gradient="linear-gradient(135deg, #059669, #34D399)"
          shadow="rgba(5,150,105,0.35)"
        />

        <StatCard
          label="Drafts"
          value={draftEvents}
          Icon={FileText}
          gradient="linear-gradient(135deg, #EA580C, #FBBF24)"
          shadow="rgba(234,88,12,0.35)"
        />
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mb-8 rounded-3xl border-[3px] border-[#E6D3DA] bg-gradient-to-r from-[#FFF4F7] via-white to-[#FFF8E6] p-5 shadow-[0_12px_36px_rgba(74,13,36,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={24}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9F1239]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search events..."
              className="w-full rounded-xl border-[3px] border-[#D9E2EF] bg-white py-4 pl-14 pr-4 text-[18px] font-bold text-[#3B0A1E] outline-none transition-all duration-200 placeholder:font-semibold placeholder:text-[#8A9AB0] hover:-translate-y-0.5 hover:border-[#F59E0B] hover:shadow-md focus:-translate-y-0.5 focus:border-[#9F1239] focus:shadow-lg focus:ring-4 focus:ring-[#9F1239]/15"
            />
          </div>

          {/* Status */}

          <div className="relative lg:w-52">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">All Status</option>

              <option value="published">Published</option>

              <option value="draft">Draft</option>
            </select>

            <ChevronDown
              size={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F1239]"
            />
          </div>

          {/* Year */}

          <div className="relative lg:w-44">
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">All Years</option>

              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <ChevronDown
              size={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F1239]"
            />
          </div>

          {/* Refresh */}

          <motion.button
            type="button"
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.93 }}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0891B2] to-[#38BDF8] px-6 py-4 text-[18px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl disabled:opacity-60"
          >
            <RefreshCw size={22} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* =====================================================
          RESULTS COUNT
      ===================================================== */}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-[19px] font-bold text-[#6B4A57]">
          Showing{" "}
          <span className="rounded-md bg-[#FFE4EC] px-2.5 py-0.5 font-extrabold text-[#9F1239]">
            {filteredEvents.length}
          </span>{" "}
          of{" "}
          <span className="rounded-md bg-[#FFF3D6] px-2.5 py-0.5 font-extrabold text-[#B45309]">
            {events.length}
          </span>{" "}
          events
        </p>
      </div>

      {/* =====================================================
          EVENTS
      ===================================================== */}

      {loading ? (
        <div className="rounded-3xl border-[3px] border-[#E6D3DA] bg-white p-16 text-center shadow-lg">
          <RefreshCw
            size={52}
            className="mx-auto animate-spin text-[#9F1239]"
          />

          <p className="mt-5 text-[22px] font-extrabold text-[#6B4A57]">
            Loading events...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[28px] border-[3px] border-dashed border-[#E3B8C6] bg-gradient-to-br from-white via-[#FFF4F7] to-[#FFF8E6] p-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#9F1239] to-[#F59E0B] text-white shadow-xl"
          >
            <CalendarDays size={44} />
          </motion.div>

          <h3 className="mt-7 text-4xl font-extrabold text-[#4A0D24]">
            No matching events
          </h3>

          <p className="mt-3 text-xl font-semibold text-[#6B4A57]">
            Try changing your search or filters.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => {
              const eventImage = getEventImage(event);
              const isPublished = event.status === "published";
              const accent = isPublished
                ? "linear-gradient(135deg, #059669, #34D399)"
                : "linear-gradient(135deg, #EA580C, #FBBF24)";

              return (
                <motion.article
                  key={event._id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    delay: Math.min(index * 0.05, 0.3),
                    duration: 0.35,
                  }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-[26px] border-[3px] border-[#E6D3DA] bg-white transition-shadow duration-300 hover:border-[#D88AA3] hover:shadow-[0_26px_54px_rgba(74,13,36,0.18)]"
                >
                  <div
                    className="absolute inset-y-0 left-0 z-10 w-2.5"
                    style={{ background: accent }}
                  />

                  <div className="flex flex-col xl:flex-row">
                    {/* IMAGE */}

                    <div className="relative shrink-0 overflow-hidden xl:w-72">
                      {eventImage ? (
                        <img
                          src={eventImage}
                          alt={event.title || "Jashna Edu event"}
                          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110 xl:h-full xl:min-h-[240px]"
                        />
                      ) : (
                        <div className="flex h-56 min-h-[240px] w-full items-center justify-center bg-gradient-to-br from-[#4A0D24] via-[#7F1D3D] to-[#B45309] xl:h-full">
                          <div className="px-5 text-center text-white/85">
                            <CalendarDays size={42} className="mx-auto mb-3" />

                            <p className="text-[16px] font-extrabold uppercase tracking-widest">
                              Jashna Edu
                            </p>

                            <p className="mt-1 text-[16px] font-semibold">
                              No image
                            </p>
                          </div>
                        </div>
                      )}

                      <span className="absolute left-5 top-4 flex h-11 min-w-[44px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-[#9F1239] to-[#E11D48] px-2 text-[18px] font-extrabold text-white shadow-lg">
                        {index + 1}
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div className="flex-1 p-6 sm:p-7">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          {/* Category */}

                          <div className="mb-3 flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex rounded-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider text-[#92400E]">
                              {event.category || "Event"}
                            </span>

                            <span
                              className={`inline-flex rounded-full px-4 py-1.5 text-[14px] font-extrabold uppercase tracking-wider ${
                                isPublished
                                  ? "bg-[#DDF8E8] text-[#15803D]"
                                  : "bg-[#FFEDD5] text-[#C2410C]"
                              }`}
                            >
                              {event.status}
                            </span>
                          </div>

                          {/* Title */}

                          <h3 className="text-[32px] font-extrabold leading-tight text-[#4A0D24] transition-colors group-hover:text-[#9F1239] sm:text-[36px]">
                            {event.title}
                          </h3>
                        </div>

                        {/* Date */}

                        <div className="flex shrink-0 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FFE4EC] to-[#FFEDD5] px-4 py-2.5 text-[18px] font-extrabold text-[#9F1239] shadow-sm transition-transform group-hover:scale-105">
                          <CalendarDays size={22} />

                          {formatDate(event.date, event.datePrecision)}
                        </div>
                      </div>

                      {/* Location */}

                      {event.location && (
                        <div className="mt-5 flex items-start gap-2.5 text-[19px] font-bold text-[#0E7490]">
                          <MapPin size={22} className="mt-0.5 shrink-0" />

                          <span>{event.location}</span>
                        </div>
                      )}

                      {/* Description */}

                      {event.description && (
                        <p className="mt-4 max-w-3xl text-[19px] font-semibold leading-8 text-[#5B4650]">
                          {event.description}
                        </p>
                      )}

                      {/* Actions */}

                      <div className="mt-7 flex flex-wrap items-center gap-3.5 border-t-[3px] border-[#F1E3E8] pt-6">
                        {/* EDIT */}

                        <motion.button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/events/edit/${event._id}`)
                          }
                          whileHover={{ scale: 1.07, y: -3 }}
                          whileTap={{ scale: 0.92 }}
                          className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#38BDF8] px-6 py-3.5 text-[18px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
                        >
                          <Edit3 size={20} />
                          Edit
                        </motion.button>

                        {/* DELETE */}

                        <motion.button
                          type="button"
                          onClick={() => handleDelete(event._id, event.title)}
                          whileHover={{ scale: 1.07, y: -3 }}
                          whileTap={{ scale: 0.92 }}
                          className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#BE123C] to-[#FB7185] px-6 py-3.5 text-[18px] font-extrabold text-white shadow-md transition-shadow hover:shadow-xl"
                        >
                          <Trash2 size={20} />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AdminEvents;
