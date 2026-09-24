import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ImagePlus,
  MapPin,
  Save,
  X,
  Upload,
  LoaderCircle,
} from "lucide-react";

function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    datePrecision: "exact",
    location: "",
    description: "",
    image: "",
    status: "published",
    category: "Event",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  // ----------------------------------------
  // Load existing event when editing
  // ----------------------------------------
  useEffect(() => {
    if (!isEditMode) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");

          navigate("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load event.");
        }

        setFormData({
          title: data.title || "",
          date: data.date
            ? new Date(data.date).toISOString().slice(0, 10)
            : "",
          datePrecision: data.datePrecision || "exact",
          location: data.location || "",
          description: data.description || "",
          image: data.image || "",
          status: data.status || "published",
          category: data.category || "Event",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isEditMode, navigate]);

  // ----------------------------------------
  // Handle form input changes
  // ----------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ----------------------------------------
  // Upload image to backend → Cloudinary
  // ----------------------------------------
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSelectedFileName(file.name);

    // Frontend validation
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      setSelectedFileName("");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be 10 MB or less.");
      setSelectedFileName("");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/upload/image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      if (!data.imageUrl) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      // Save Cloudinary URL into event form
      setFormData((previous) => ({
        ...previous,
        image: data.imageUrl,
      }));
    } catch (error) {
      setError(error.message);
      setSelectedFileName("");
    } finally {
      setUploadingImage(false);

      // Allow selecting the same file again later
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ----------------------------------------
  // Create OR update event
  // ----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (uploadingImage) {
      setError("Please wait until the image upload is complete.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      if (!formData.title.trim()) {
        throw new Error("Event title is required.");
      }

      if (!formData.date) {
        throw new Error("Event date is required.");
      }

      const response = await fetch(
        isEditMode
          ? `http://localhost:5000/api/events/${id}`
          : "http://localhost:5000/api/events",
        {
          method: isEditMode ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditMode
              ? "Failed to update event."
              : "Failed to create event."),
        );
      }

      // Return to dashboard after successful save
      navigate("/admin/events");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-jashna-charcoal">
      {/* Header */}
      <header className="border-b border-jashna-stone bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className="flex items-center gap-2 text-sm font-semibold text-jashna-muted hover:text-jashna-maroon transition"
          >
            <ArrowLeft size={18} />
            Back to Events
          </button>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.25em] text-jashna-gold font-bold">
              Jashna Edu
            </p>

            <p className="text-sm font-semibold mt-1">Admin Portal</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-jashna-gold font-bold">
            Content Management
          </p>

          <h1 className="font-display text-4xl sm:text-5xl text-jashna-maroon-dark mt-2">
            {isEditMode ? "Edit Event" : "Add New Event"}
          </h1>

          <p className="text-jashna-muted mt-3">
            {isEditMode
              ? "Update the details of this Jashna Edu event."
              : "Add an event that will appear in the Jashna Edu events section."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* -------------------------------- */}
            {/* EVENT INFORMATION */}
            {/* -------------------------------- */}
            <section className="rounded-2xl border border-jashna-stone bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-7">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-jashna-maroon/10 flex items-center justify-center text-jashna-maroon">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Event Information
                  </h2>

                  <p className="text-sm text-jashna-muted mt-1">
                    Add the basic details of your event.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold mb-2"
                  >
                    Event Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Seminar & Mock Interview"
                    required
                    className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10 transition"
                  />
                </div>

                {/* Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-semibold mb-2"
                    >
                      Date <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="datePrecision"
                      className="block text-sm font-semibold mb-2"
                    >
                      Date Precision
                    </label>

                    <select
                      id="datePrecision"
                      name="datePrecision"
                      value={formData.datePrecision}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10 transition"
                    >
                      <option value="exact">Exact date</option>
                      <option value="month">Month only</option>
                      <option value="year">Year only</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold mb-2"
                  >
                    Location
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-jashna-muted"
                    />

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. DAV Institute of Management (DAVIM)"
                      className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10 transition"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold mb-2"
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10 transition"
                  >
                    <option value="Event">Event</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Competition">Competition</option>
                    <option value="Training">Training</option>
                    <option value="Career Counselling">
                      Career Counselling
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold mb-2"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write a short description of the event..."
                    className="w-full resize-y rounded-xl border border-jashna-stone bg-jashna-ivory/40 px-4 py-3.5 text-sm outline-none focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10 transition"
                  />
                </div>
              </div>
            </section>

            {/* -------------------------------- */}
            {/* EVENT IMAGE */}
            {/* -------------------------------- */}
            <section className="rounded-2xl border border-jashna-stone bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-7">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-jashna-gold/10 flex items-center justify-center text-jashna-gold">
                  <ImagePlus size={19} />
                </div>

                <div>
                  <h2 className="font-display text-2xl text-jashna-maroon-dark">
                    Event Image
                  </h2>

                  <p className="text-sm text-jashna-muted mt-1">
                    Upload an image that will represent this event.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Upload area */}
              <div className="rounded-2xl border-2 border-dashed border-jashna-stone bg-jashna-ivory/30 p-6 sm:p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-jashna-maroon/10 flex items-center justify-center text-jashna-maroon">
                  {uploadingImage ? (
                    <LoaderCircle size={23} className="animate-spin" />
                  ) : (
                    <Upload size={23} />
                  )}
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  {uploadingImage
                    ? "Uploading image..."
                    : "Upload event image"}
                </h3>

                <p className="text-xs text-jashna-muted mt-2">
                  JPG, PNG, WEBP or other image formats up to 10 MB
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-jashna-maroon px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-jashna-maroon-dark disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  {uploadingImage ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      {formData.image ? "Replace Image" : "Choose Image"}
                    </>
                  )}
                </button>

                {selectedFileName && (
                  <p className="text-xs text-jashna-muted mt-4 break-all">
                    Selected:{" "}
                    <span className="font-medium text-jashna-charcoal">
                      {selectedFileName}
                    </span>
                  </p>
                )}
              </div>

              {/* Current / uploaded image */}
              {formData.image && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">
                      {isEditMode ? "Current Image" : "Uploaded Image"}
                    </p>

                    {uploadingImage && (
                      <span className="text-xs text-jashna-muted">
                        Uploading...
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl overflow-hidden border border-jashna-stone max-w-md">
                    <img
                      src={formData.image}
                      alt="Event preview"
                      className="w-full h-52 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* -------------------------------- */}
            {/* PUBLISHING */}
            {/* -------------------------------- */}
            <section className="rounded-2xl border border-jashna-stone bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-2xl text-jashna-maroon-dark">
                Publishing
              </h2>

              <p className="text-sm text-jashna-muted mt-1 mb-6">
                Choose whether this event should be visible on the website.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Published */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    formData.status === "published"
                      ? "border-jashna-maroon bg-jashna-maroon/5"
                      : "border-jashna-stone hover:border-jashna-maroon/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === "published"}
                      onChange={handleChange}
                      className="mt-1"
                    />

                    <div>
                      <p className="font-semibold">Publish immediately</p>

                      <p className="text-xs text-jashna-muted mt-1">
                        The event will be visible on the public website.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Draft */}
                <label
                  className={`cursor-pointer rounded-xl border p-5 transition ${
                    formData.status === "draft"
                      ? "border-jashna-maroon bg-jashna-maroon/5"
                      : "border-jashna-stone hover:border-jashna-maroon/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={handleChange}
                      className="mt-1"
                    />

                    <div>
                      <p className="font-semibold">Save as draft</p>

                      <p className="text-xs text-jashna-muted mt-1">
                        Keep the event hidden until it is ready.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="flex items-center justify-center gap-2 rounded-xl border border-jashna-stone bg-white px-6 py-3.5 text-sm font-semibold hover:border-jashna-maroon transition"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex items-center justify-center gap-2 rounded-xl bg-jashna-maroon px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-jashna-maroon-dark disabled:cursor-not-allowed disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  {isEditMode ? "Saving Changes..." : "Creating Event..."}
                </>
              ) : (
                <>
                  <Save size={17} />
                  {isEditMode ? "Save Changes" : "Create Event"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EventForm;