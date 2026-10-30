import { useCallback, useEffect, useState } from "react";
import {
  Settings,
  Users,
  Plus,
  Pencil,
  X,
  Check,
  Clock3,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Power,
  Cloud,
  Folder,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Eye,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Heading,
  List,
  RotateCcw,
  Trash2,
  Type,
} from "lucide-react";

import { API_URL } from "../config";

const EMPTY_FORM = {
  timing: "",
  description: "",
};

const EMPTY_INSTITUTE_SETTINGS = {
  instituteName: "",
  contactEmail: "",
  contactNumber: "",
  whatsappNumber: "",
  websiteUrl: "",
  address: "",
  footerDescription: "",
};

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("batches");

  // =========================================================
  // BATCH MANAGEMENT
  // =========================================================

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // GENERAL INSTITUTE SETTINGS
  // =========================================================

  const [instituteSettings, setInstituteSettings] = useState(
    EMPTY_INSTITUTE_SETTINGS,
  );

  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [generalSuccess, setGeneralSuccess] = useState("");

  // =========================================================
  // GOOGLE DRIVE CONNECTION STATUS
  // =========================================================

  const [driveStatus, setDriveStatus] = useState(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState("");

  // =========================================================
  // ADMIN PASSWORD CHANGE WITH EMAIL OTP
  // =========================================================

  const [accountStep, setAccountStep] = useState("request");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resendCountdown, setResendCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const getToken = () => localStorage.getItem("adminToken");
  // =========================================================
  // ADMIN PASSWORD CHANGE HANDLERS
  // =========================================================

  const resetAccountFlow = () => {
    setAccountStep("request");
    setAccountError("");
    setAccountSuccess("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResendCountdown(0);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (activeTab !== "account" || resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setResendCountdown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [activeTab, resendCountdown]);

  const requestAdminOtp = async () => {
    setAccountError("");
    setAccountSuccess("");
    setAccountLoading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/auth/admin/password/request-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.retryAfterSeconds) {
          setResendCountdown(data.retryAfterSeconds);
        }

        throw new Error(
          data.message || "Unable to send the verification code.",
        );
      }

      setAccountStep("verify");
      setOtp("");
      setResendCountdown(data.resendAfterSeconds || 60);

      setAccountSuccess(
        data.message ||
          "Verification code sent to your registered email address.",
      );
    } catch (err) {
      setAccountError(err.message || "Unable to request a verification code.");
    } finally {
      setAccountLoading(false);
    }
  };

  const verifyAdminOtp = async (event) => {
    event.preventDefault();

    setAccountError("");
    setAccountSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setAccountError("Enter the six-digit verification code.");
      return;
    }

    setAccountLoading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/auth/admin/password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setAccountStep("change");
      setOtp("");
      setAccountSuccess(
        data.message ||
          "Email verification successful. You can now change your password.",
      );
    } catch (err) {
      setAccountError(err.message || "OTP verification failed.");
    } finally {
      setAccountLoading(false);
    }
  };

  const changeAdminPassword = async (event) => {
    event.preventDefault();

    setAccountError("");
    setAccountSuccess("");

    if (newPassword.length < 8) {
      setAccountError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAccountError("The new password and confirmation do not match.");
      return;
    }

    setAccountLoading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/auth/admin/password/change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change the password.");
      }

      setAccountStep("complete");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setAccountSuccess(
        data.message || "Your admin password has been changed successfully.",
      );
    } catch (err) {
      setAccountError(err.message || "Unable to change the password.");
    } finally {
      setAccountLoading(false);
    }
  };
  // =========================================================
  // FETCH BATCHES
  // =========================================================

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        setError("Admin session not found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load batches.");
      }

      setBatches(data.batches || []);
    } catch (err) {
      setError(err.message || "Unable to load batches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // =========================================================
  // FETCH INSTITUTE SETTINGS
  // GET /api/settings
  // =========================================================

  const fetchInstituteSettings = useCallback(async () => {
    setGeneralLoading(true);
    setGeneralError("");
    setGeneralSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/settings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load institute settings.");
      }

      setInstituteSettings({
        ...EMPTY_INSTITUTE_SETTINGS,
        ...(data.settings || {}),
      });
    } catch (err) {
      setGeneralError(err.message || "Unable to load institute settings.");
    } finally {
      setGeneralLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "general") {
      fetchInstituteSettings();
    }
  }, [activeTab, fetchInstituteSettings]);

  // =========================================================
  // HANDLE INSTITUTE SETTINGS INPUTS
  // =========================================================

  const handleInstituteSettingsChange = (event) => {
    const { name, value } = event.target;

    setInstituteSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setGeneralError("");
    setGeneralSuccess("");
  };

  // =========================================================
  // SAVE INSTITUTE SETTINGS
  // PUT /api/settings
  // =========================================================

  const handleInstituteSettingsSubmit = async (event) => {
    event.preventDefault();

    setGeneralError("");
    setGeneralSuccess("");

    const requiredFields = [
      ["instituteName", "Institute name"],
      ["contactEmail", "Contact email"],
      ["contactNumber", "Contact number"],
      ["address", "Institute address"],
    ];

    for (const [field, label] of requiredFields) {
      if (!instituteSettings[field]?.trim()) {
        setGeneralError(`${label} cannot be empty.`);
        return;
      }
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(instituteSettings.contactEmail.trim())) {
      setGeneralError("Please enter a valid contact email address.");
      return;
    }

    if (instituteSettings.websiteUrl.trim()) {
      try {
        const website = new URL(instituteSettings.websiteUrl.trim());

        if (!["http:", "https:"].includes(website.protocol)) {
          throw new Error("Invalid website protocol.");
        }
      } catch {
        setGeneralError(
          "Please enter a valid website URL beginning with https:// or http://.",
        );
        return;
      }
    }

    setGeneralSaving(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const payload = {
        instituteName: instituteSettings.instituteName.trim(),
        contactEmail: instituteSettings.contactEmail.trim(),
        contactNumber: instituteSettings.contactNumber.trim(),
        whatsappNumber: instituteSettings.whatsappNumber.trim(),
        websiteUrl: instituteSettings.websiteUrl.trim(),
        address: instituteSettings.address.trim(),
        footerDescription: instituteSettings.footerDescription.trim(),
      };

      const response = await fetch(`${API_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save institute settings.");
      }

      setInstituteSettings({
        ...EMPTY_INSTITUTE_SETTINGS,
        ...(data.settings || payload),
      });

      setGeneralSuccess(
        data.message || "Institute settings saved successfully.",
      );
    } catch (err) {
      setGeneralError(err.message || "Unable to save institute settings.");
    } finally {
      setGeneralSaving(false);
    }
  };

  // =========================================================
  // GOOGLE DRIVE STATUS
  // =========================================================

  const fetchDriveStatus = useCallback(async () => {
    setDriveLoading(true);
    setDriveError("");

    try {
      const token = getToken();

      if (!token) {
        setDriveStatus(null);
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/drive/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setDriveStatus(data);

      if (!response.ok || !data.connected) {
        throw new Error(
          data.message || "Google Drive connection could not be verified.",
        );
      }
    } catch (err) {
      setDriveError(err.message || "Unable to check Google Drive status.");
    } finally {
      setDriveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "drive") {
      fetchDriveStatus();
    }
  }, [activeTab, fetchDriveStatus]);

  // =========================================================
  // BATCH MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingBatch(null);
    setFormData(EMPTY_FORM);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);

    setFormData({
      timing: batch.timing || "",
      description: batch.description || "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingBatch(null);
    setFormData(EMPTY_FORM);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE BATCH
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.timing.trim()) {
      setError("Batch timing is required.");
      return;
    }

    setSaving(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const isEditing = Boolean(editingBatch);

      const url = isEditing
        ? `${API_URL}/api/batches/${editingBatch._id}`
        : `${API_URL}/api/batches`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timing: formData.timing.trim(),
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save batch.");
      }

      setModalOpen(false);
      setEditingBatch(null);
      setFormData(EMPTY_FORM);

      setSuccess(
        data.message ||
          (isEditing
            ? "Batch updated successfully."
            : "Batch created successfully."),
      );

      await fetchBatches();
    } catch (err) {
      setError(err.message || "Unable to save batch.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE BATCH
  // =========================================================

  const handleStatusChange = async (batch) => {
    setError("");
    setSuccess("");

    const nextStatus = !batch.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate the ${batch.timing} batch?`
        : `Deactivate the ${batch.timing} batch?`,
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/batches/${batch._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update batch status.");
      }

      setSuccess(data.message || "Batch status updated.");

      await fetchBatches();
    } catch (err) {
      setError(err.message || "Unable to update batch status.");
    }
  };

  const activeCount = batches.filter((batch) => batch.isActive).length;
  const inactiveCount = batches.length - activeCount;

  // =========================================================
  // PAGE UI
  // =========================================================

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#338DFD]/20 bg-[#338DFD]/10 px-3 py-1.5 text-xs font-extrabold text-[#246FC9]">
            <Settings size={14} />
            ADMIN CONFIGURATION
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#102B4E] sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Manage institute information, batch timings, account settings and
            Google Drive integration.
          </p>
        </div>

        {activeTab !== "privacy" && (
          <button
            type="button"
            onClick={() => {
              if (activeTab === "general") {
                fetchInstituteSettings();
              } else if (activeTab === "drive") {
                fetchDriveStatus();
              } else {
                fetchBatches();
              }
            }}
            disabled={
              activeTab === "general"
                ? generalLoading || generalSaving
                : activeTab === "drive"
                  ? driveLoading
                  : loading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#102B4E] shadow-sm transition hover:border-[#338DFD]/40 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                (activeTab === "general" && generalLoading) ||
                (activeTab === "drive" && driveLoading) ||
                (activeTab === "batches" && loading)
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        )}
      </div>

      {/* SETTINGS TABS */}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <SettingsTab
          active={activeTab === "general"}
          onClick={() => setActiveTab("general")}
          icon={<Settings size={17} />}
          label="General"
        />

        <SettingsTab
          active={activeTab === "batches"}
          onClick={() => setActiveTab("batches")}
          icon={<Users size={17} />}
          label="Batches"
        />

        <SettingsTab
          active={activeTab === "account"}
          onClick={() => setActiveTab("account")}
          icon={<CheckCircle2 size={17} />}
          label="Admin Account"
        />

        <SettingsTab
          active={activeTab === "drive"}
          onClick={() => setActiveTab("drive")}
          icon={<Cloud size={17} />}
          label="Google Drive"
        />

        <SettingsTab
          active={activeTab === "privacy"}
          onClick={() => setActiveTab("privacy")}
          icon={<ShieldCheck size={17} />}
          label="Privacy Policy"
        />
      </div>

      {/* GLOBAL FEEDBACK */}

      {error && !modalOpen && activeTab === "batches" && (
        <Feedback type="error" message={error} />
      )}

      {success && !modalOpen && activeTab === "batches" && (
        <Feedback type="success" message={success} />
      )}

      {/* =====================================================
      GENERAL SETTINGS
  ===================================================== */}

      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#338DFD]">
                  <Settings size={25} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#102B4E]">
                    Institute Information
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Manage the contact details and information displayed on the
                    public website.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {generalError && (
                <div className="mb-5">
                  <Feedback type="error" message={generalError} />
                </div>
              )}

              {generalSuccess && (
                <div className="mb-5">
                  <Feedback type="success" message={generalSuccess} />
                </div>
              )}

              {generalLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                  <LoaderCircle
                    size={22}
                    className="animate-spin text-[#338DFD]"
                  />
                  Loading institute information...
                </div>
              ) : (
                <form
                  onSubmit={handleInstituteSettingsSubmit}
                  className="space-y-7"
                >
                  {/* BASIC INFORMATION */}

                  <div>
                    <div className="mb-4">
                      <h3 className="text-base font-black text-[#102B4E]">
                        Basic Information
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        These details identify your institute on the website.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField
                        label="Institute Name"
                        name="instituteName"
                        value={instituteSettings.instituteName}
                        onChange={handleInstituteSettingsChange}
                        placeholder="Jashna Edu"
                        required
                      />

                      <FormField
                        label="Contact Email"
                        name="contactEmail"
                        type="email"
                        value={instituteSettings.contactEmail}
                        onChange={handleInstituteSettingsChange}
                        placeholder="info@jashnaedu.com"
                        required
                      />

                      <FormField
                        label="Contact Number"
                        name="contactNumber"
                        type="tel"
                        value={instituteSettings.contactNumber}
                        onChange={handleInstituteSettingsChange}
                        placeholder="+91 99530 06751"
                        required
                      />

                      <FormField
                        label="WhatsApp Number"
                        name="whatsappNumber"
                        type="tel"
                        value={instituteSettings.whatsappNumber}
                        onChange={handleInstituteSettingsChange}
                        placeholder="+91 99530 06751"
                      />

                      <div className="md:col-span-2">
                        <FormField
                          label="Website URL"
                          name="websiteUrl"
                          type="url"
                          value={instituteSettings.websiteUrl}
                          onChange={handleInstituteSettingsChange}
                          placeholder="https://www.jashnaedu.com/"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS AND FOOTER */}

                  <div className="border-t border-slate-100 pt-6">
                    <div className="mb-4">
                      <h3 className="text-base font-black text-[#102B4E]">
                        Address & Footer
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Control the address and short description displayed in
                        the website footer.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="address"
                          className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                        >
                          Institute Address
                        </label>

                        <textarea
                          id="address"
                          name="address"
                          value={instituteSettings.address}
                          onChange={handleInstituteSettingsChange}
                          required
                          maxLength={500}
                          rows={3}
                          placeholder="Enter the full institute address"
                          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="footerDescription"
                          className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                        >
                          Footer Description
                        </label>

                        <textarea
                          id="footerDescription"
                          name="footerDescription"
                          value={instituteSettings.footerDescription}
                          onChange={handleInstituteSettingsChange}
                          maxLength={500}
                          rows={3}
                          placeholder="A short description about your institute"
                          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
                        />

                        <p className="mt-2 text-right text-xs text-slate-400">
                          {instituteSettings.footerDescription.length}/500
                          characters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SAVE ACTIONS */}

                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-400">
                      Changes are saved to the database. The public footer will
                      use these details once its dynamic integration is
                      connected.
                    </p>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={fetchInstituteSettings}
                        disabled={generalLoading || generalSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#102B4E] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw
                          size={16}
                          className={generalLoading ? "animate-spin" : ""}
                        />
                        Reset Changes
                      </button>

                      <button
                        type="submit"
                        disabled={generalSaving || generalLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#1B416F] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {generalSaving ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Check size={17} />
                        )}

                        {generalSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
    ADMIN ACCOUNT — EMAIL OTP PASSWORD CHANGE
===================================================== */}

      {activeTab === "account" && (
        <div className="space-y-6">
          {/* ACCOUNT HEADER */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#338DFD]">
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#102B4E]">
                    Admin Account Security
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Change your admin password after verifying your registered
                    email address.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* ERROR MESSAGE */}

              {accountError && (
                <div className="mb-5">
                  <Feedback type="error" message={accountError} />
                </div>
              )}

              {/* SUCCESS MESSAGE */}

              {accountSuccess && (
                <div className="mb-5">
                  <Feedback type="success" message={accountSuccess} />
                </div>
              )}

              {/* PROGRESS INDICATOR */}

              <div className="mb-8 grid grid-cols-3 gap-3">
                {[
                  { key: "request", label: "Request OTP", number: "01" },
                  { key: "verify", label: "Verify Email", number: "02" },
                  { key: "change", label: "New Password", number: "03" },
                ].map((step, index) => {
                  const stepOrder = ["request", "verify", "change", "complete"];
                  const currentIndex = stepOrder.indexOf(accountStep);
                  const stepIndex = index;

                  const completed = currentIndex > stepIndex;
                  const current = currentIndex === stepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`rounded-xl border p-3 sm:p-4 ${
                        current
                          ? "border-[#338DFD] bg-blue-50"
                          : completed
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                          current
                            ? "bg-[#338DFD] text-white"
                            : completed
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {completed ? <Check size={16} /> : step.number}
                      </div>

                      <p
                        className={`mt-3 text-xs font-extrabold sm:text-sm ${
                          current
                            ? "text-[#246FC9]"
                            : completed
                              ? "text-emerald-700"
                              : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: REQUEST OTP */}

              {accountStep === "request" && (
                <div className="max-w-2xl rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#338DFD]">
                    <Mail size={24} />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-[#102B4E]">
                    Verify your identity
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    We'll send a six-digit verification code to the email
                    address registered to your admin account. You must verify
                    this code before changing your password.
                  </p>

                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-bold text-[#246FC9]">
                      Email verification required
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      For security, the destination email is selected by the
                      server from your registered admin account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={requestAdminOtp}
                    disabled={accountLoading}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1B416F] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {accountLoading ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                      <Mail size={18} />
                    )}

                    {accountLoading
                      ? "Sending OTP..."
                      : "Send Verification Code"}
                  </button>
                </div>
              )}

              {/* STEP 2: VERIFY OTP */}

              {accountStep === "verify" && (
                <form
                  onSubmit={verifyAdminOtp}
                  className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 p-5 sm:p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#338DFD]">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <h3 className="mt-4 text-lg font-black text-[#102B4E]">
                      Enter your verification code
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Enter the six-digit code sent to your registered email.
                      The code expires after 10 minutes.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="adminPasswordOtp"
                      className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                    >
                      Six-digit OTP
                    </label>

                    <input
                      id="adminPasswordOtp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => {
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                        setAccountError("");
                        setAccountSuccess("");
                      }}
                      placeholder="Enter 6-digit code"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-black tracking-[0.4em] text-[#102B4E] outline-none transition placeholder:text-sm placeholder:font-medium placeholder:tracking-normal focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10 sm:max-w-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={accountLoading || otp.length !== 6}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1B416F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {accountLoading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}

                      {accountLoading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                      type="button"
                      onClick={requestAdminOtp}
                      disabled={accountLoading || resendCountdown > 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-[#102B4E] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw size={16} />

                      {resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Resend OTP"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={resetAccountFlow}
                    disabled={accountLoading}
                    className="text-sm font-bold text-slate-500 transition hover:text-[#246FC9] disabled:opacity-50"
                  >
                    Cancel and start again
                  </button>
                </form>
              )}

              {/* STEP 3: CHANGE PASSWORD */}

              {accountStep === "change" && (
                <form
                  onSubmit={changeAdminPassword}
                  className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 p-5 sm:p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <LockKeyhole size={24} />
                  </div>

                  <div>
                    <h3 className="mt-4 text-lg font-black text-[#102B4E]">
                      Set your new password
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Your email has been verified. Create a new password to
                      complete the process.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="adminNewPassword"
                      className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        id="adminNewPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => {
                          setNewPassword(event.target.value);
                          setAccountError("");
                        }}
                        minLength={8}
                        maxLength={128}
                        required
                        placeholder="Enter your new password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-medium text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword((value) => !value)}
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#102B4E]"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Use at least 8 characters. Avoid reusing an old password.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="adminConfirmPassword"
                      className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                    >
                      Confirm New Password
                    </label>

                    <div className="relative">
                      <input
                        id="adminConfirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setAccountError("");
                        }}
                        minLength={8}
                        maxLength={128}
                        required
                        placeholder="Re-enter your new password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-medium text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#102B4E]"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {confirmPassword && (
                    <p
                      className={`text-sm font-semibold ${
                        newPassword === confirmPassword
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {newPassword === confirmPassword
                        ? "Passwords match."
                        : "Passwords do not match."}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                    <button
                      type="submit"
                      disabled={
                        accountLoading ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1B416F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {accountLoading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <LockKeyhole size={18} />
                      )}

                      {accountLoading
                        ? "Changing Password..."
                        : "Change Password"}
                    </button>

                    <button
                      type="button"
                      onClick={resetAccountFlow}
                      disabled={accountLoading}
                      className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: SUCCESS */}

              {accountStep === "complete" && (
                <div className="max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={30} />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-emerald-900">
                    Password Changed Successfully
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-emerald-800">
                    Your admin password has been updated. Use your new password
                    the next time you log in.
                  </p>

                  <button
                    type="button"
                    onClick={resetAccountFlow}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1B416F]"
                  >
                    <LockKeyhole size={17} />
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
      GOOGLE DRIVE
  ===================================================== */}

      {activeTab === "drive" && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#338DFD]">
                  <Cloud size={25} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#102B4E]">
                    Google Drive Integration
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Check the connection used to store student task submissions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDriveStatus}
                disabled={driveLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#102B4E] transition hover:border-[#338DFD]/40 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={driveLoading ? "animate-spin" : ""}
                />
                {driveLoading ? "Checking..." : "Refresh Status"}
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {driveLoading && !driveStatus ? (
                <div className="flex min-h-36 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                  <LoaderCircle
                    size={22}
                    className="animate-spin text-[#338DFD]"
                  />
                  Checking Google Drive connection...
                </div>
              ) : (
                <>
                  <div
                    className={`flex items-start gap-3 rounded-xl border p-4 ${
                      driveStatus?.connected && !driveError
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    {driveStatus?.connected && !driveError ? (
                      <CheckCircle2
                        size={21}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                    ) : (
                      <AlertCircle
                        size={21}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />
                    )}

                    <div>
                      <p
                        className={`font-extrabold ${
                          driveStatus?.connected && !driveError
                            ? "text-emerald-800"
                            : "text-amber-800"
                        }`}
                      >
                        {driveLoading
                          ? "Checking connection..."
                          : driveStatus?.connected && !driveError
                            ? "Google Drive Connected"
                            : "Connection Not Verified"}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {driveError ||
                          (driveStatus?.connected
                            ? "The server can access the authenticated Google account and the configured root folder."
                            : "Refresh the status to check the Google Drive connection.")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Mail size={17} />
                        Connected Google Account
                      </div>

                      <p className="mt-3 break-all text-base font-extrabold text-[#102B4E]">
                        {driveStatus?.account?.email || "Not available"}
                      </p>

                      {driveStatus?.account?.displayName && (
                        <p className="mt-1 text-sm text-slate-500">
                          {driveStatus.account.displayName}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Folder size={17} />
                        Root Folder
                      </div>

                      <p className="mt-3 break-words text-base font-extrabold text-[#102B4E]">
                        {driveStatus?.rootFolder?.name ||
                          "Folder information unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {driveStatus?.rootFolder?.accessible
                          ? "Folder access verified"
                          : "Folder access not verified"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">
                    <p className="text-sm font-extrabold text-[#102B4E]">
                      Integration Purpose
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Google Drive is used as the storage destination for
                      student task submission files. Connection details are
                      checked securely by the backend; credentials are not
                      displayed here.
                    </p>
                  </div>

                  {driveStatus?.checkedAt && (
                    <p className="text-xs text-slate-400">
                      Last checked:{" "}
                      {new Date(driveStatus.checkedAt).toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
      PRIVACY POLICY EDITOR
  ===================================================== */}

      {activeTab === "privacy" && <PrivacyPolicyEditor />}

      {/* =====================================================
      BATCH MANAGEMENT
  ===================================================== */}

      {activeTab === "batches" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Batches"
              value={batches.length}
              icon={<Users size={21} />}
              color="blue"
            />

            <SummaryCard
              label="Active Batches"
              value={activeCount}
              icon={<CheckCircle2 size={21} />}
              color="green"
            />

            <SummaryCard
              label="Inactive Batches"
              value={inactiveCount}
              icon={<Power size={21} />}
              color="slate"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-xl font-black text-[#102B4E]">
                  Batch Management
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Each class timing represents one batch. Multiple students can
                  belong to the same batch.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#102B4E]/10 transition hover:-translate-y-0.5 hover:bg-[#1B416F] active:translate-y-0"
              >
                <Plus size={18} />
                Create Batch
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-[#338DFD]"
                />
                Loading batches...
              </div>
            ) : batches.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#338DFD]">
                  <Users size={29} />
                </div>

                <h3 className="mt-5 text-lg font-black text-[#102B4E]">
                  No batches created yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Create your first batch to organize students by class timing.
                </p>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#102B4E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1B416F]"
                >
                  <Plus size={17} />
                  Create First Batch
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Batch Timing
                      </th>

                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Description
                      </th>

                      <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {batches.map((batch) => (
                      <tr
                        key={batch._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-[#246FC9]">
                            <Clock3 size={15} />
                            {batch.timing}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="max-w-xs text-sm text-slate-600">
                            {batch.description || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge active={batch.isActive} />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(batch)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#338DFD]/30 hover:bg-blue-50 hover:text-[#246FC9]"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(batch)}
                              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                                batch.isActive
                                  ? "border-red-100 text-red-600 hover:bg-red-50"
                                  : "border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              <Power size={14} />
                              {batch.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
      CREATE / EDIT BATCH MODAL
  ===================================================== */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[#102B4E]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 bg-[#102B4E] px-6 py-6 text-white sm:px-8">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#49C4A5]">
                  BATCH CONFIGURATION
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {editingBatch ? "Edit Batch Timing" : "Create New Batch"}
                </h2>

                <p className="mt-2 text-sm text-white/65">
                  Set the class timing and optionally add a description.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              {error && <Feedback type="error" message={error} />}

              <FormField
                label="Batch Timing"
                name="timing"
                value={formData.timing}
                onChange={handleChange}
                placeholder="e.g. 5:30 PM – 6:30 PM"
                required
              />

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                >
                  Description{" "}
                  <span className="font-medium text-slate-400">(Optional)</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Add a short note about this batch..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#1B416F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingBatch
                      ? "Save Changes"
                      : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// REUSABLE UI COMPONENTS
// =========================================================

function SettingsTab({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
        active
          ? "bg-[#102B4E] text-white shadow-md"
          : "text-slate-500 hover:bg-slate-100 hover:text-[#102B4E]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SummaryCard({ label, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-[#338DFD]",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-500">{label}</p>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            colors[color] || colors.slate
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight text-[#102B4E]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-extrabold text-[#102B4E]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={500}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10"
      />
    </div>
  );
}

function Feedback({ type, message }) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      )}

      <span>{message}</span>
    </div>
  );
}

function PlaceholderCard({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#338DFD]">
        <Settings size={25} />
      </div>

      <h2 className="mt-5 text-2xl font-black text-[#102B4E]">{title}</h2>

      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
        {description}
      </p>

      <span className="mt-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700">
        Coming next
      </span>
    </div>
  );
}

// =========================================================
// PRIVACY POLICY EDITOR
// Used by the "Privacy Policy" tab. The policy is a list of
// sections; each section has a title and blocks (paragraph,
// subheading or bullet list). Section numbers and the
// "Last updated" date are added automatically.
// =========================================================

const POLICY_INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#102B4E] outline-none transition placeholder:text-slate-400 focus:border-[#338DFD] focus:bg-white focus:ring-4 focus:ring-[#338DFD]/10";

const POLICY_BLOCK_LABELS = {
  paragraph: "Paragraph",
  subheading: "Subheading",
  bullets: "Bullet list",
};

// Temporary ids let React keep each input stable while items are
// moved or deleted. They are removed before saving.
let policyUidCounter = 0;
const policyUid = () =>
  `u${Date.now().toString(36)}${(policyUidCounter++).toString(36)}`;

const getAdminToken = () => localStorage.getItem("adminToken");

const newPolicyBlock = (kind) => ({
  uid: policyUid(),
  kind,
  text: "",
  items: kind === "bullets" ? [{ uid: policyUid(), value: "" }] : [],
});

const withPolicyIds = (sections) =>
  sections.map((section) => ({
    uid: policyUid(),
    title: section.title || "",
    blocks: (section.blocks || []).map((block) => ({
      uid: policyUid(),
      kind: block.kind,
      text: block.text || "",
      items:
        block.kind === "bullets"
          ? (block.items?.length ? block.items : [""]).map((value) => ({
              uid: policyUid(),
              value,
            }))
          : [],
    })),
  }));

const stripPolicyIds = (sections) =>
  sections.map((section) => ({
    title: section.title.trim(),
    blocks: section.blocks.map((block) =>
      block.kind === "bullets"
        ? { kind: "bullets", items: block.items.map((item) => item.value) }
        : { kind: block.kind, text: block.text },
    ),
  }));

const moveInArray = (array, from, to) => {
  if (to < 0 || to >= array.length) return array;

  const copy = [...array];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);

  return copy;
};

function PrivacyPolicyEditor() {
  const [sections, setSections] = useState([]);
  const [open, setOpen] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingDefault, setUsingDefault] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------------
  // LOAD  (GET /api/privacy-policy)
  // ---------------------------------------------------------

  const loadPolicy = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/privacy-policy`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load the privacy policy.");
      }

      setSections(withPolicyIds(data.policy?.sections || []));
      setLastUpdated(data.policy?.lastUpdated || null);
      setUsingDefault(Boolean(data.isDefault));
      setOpen({});
      setDirty(false);
    } catch (err) {
      setError(err.message || "Unable to load the privacy policy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // ---------------------------------------------------------
  // EDIT HELPERS
  // ---------------------------------------------------------

  const changeSections = (updater) => {
    setSections((previous) => updater(previous));
    setDirty(true);
    setError("");
    setSuccess("");
  };

  const updateSection = (sectionIndex, patch) =>
    changeSections((previous) =>
      previous.map((section, index) =>
        index === sectionIndex ? { ...section, ...patch } : section,
      ),
    );

  const updateBlocks = (sectionIndex, updater) =>
    changeSections((previous) =>
      previous.map((section, index) =>
        index === sectionIndex
          ? { ...section, blocks: updater(section.blocks) }
          : section,
      ),
    );

  const updateBlock = (sectionIndex, blockIndex, patch) =>
    updateBlocks(sectionIndex, (blocks) =>
      blocks.map((block, index) =>
        index === blockIndex ? { ...block, ...patch } : block,
      ),
    );

  const moveSection = (sectionIndex, direction) =>
    changeSections((previous) =>
      moveInArray(previous, sectionIndex, sectionIndex + direction),
    );

  const deleteSection = (sectionIndex) => {
    const title = sections[sectionIndex]?.title || "this section";

    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    changeSections((previous) =>
      previous.filter((_, index) => index !== sectionIndex),
    );
  };

  const addSection = () => {
    const section = {
      uid: policyUid(),
      title: "",
      blocks: [newPolicyBlock("paragraph")],
    };

    changeSections((previous) => [...previous, section]);
    setOpen((previous) => ({ ...previous, [section.uid]: true }));
  };

  const addBlock = (sectionIndex, kind) =>
    updateBlocks(sectionIndex, (blocks) => [...blocks, newPolicyBlock(kind)]);

  const moveBlock = (sectionIndex, blockIndex, direction) =>
    updateBlocks(sectionIndex, (blocks) =>
      moveInArray(blocks, blockIndex, blockIndex + direction),
    );

  const deleteBlock = (sectionIndex, blockIndex) =>
    updateBlocks(sectionIndex, (blocks) =>
      blocks.filter((_, index) => index !== blockIndex),
    );

  const updateBullet = (sectionIndex, blockIndex, itemIndex, value) =>
    updateBlocks(sectionIndex, (blocks) =>
      blocks.map((block, index) =>
        index === blockIndex
          ? {
              ...block,
              items: block.items.map((item, i) =>
                i === itemIndex ? { ...item, value } : item,
              ),
            }
          : block,
      ),
    );

  const addBullet = (sectionIndex, blockIndex) =>
    updateBlocks(sectionIndex, (blocks) =>
      blocks.map((block, index) =>
        index === blockIndex
          ? {
              ...block,
              items: [...block.items, { uid: policyUid(), value: "" }],
            }
          : block,
      ),
    );

  const deleteBullet = (sectionIndex, blockIndex, itemIndex) =>
    updateBlocks(sectionIndex, (blocks) =>
      blocks.map((block, index) =>
        index === blockIndex
          ? { ...block, items: block.items.filter((_, i) => i !== itemIndex) }
          : block,
      ),
    );

  const toggleSection = (sectionUid) =>
    setOpen((previous) => ({
      ...previous,
      [sectionUid]: !previous[sectionUid],
    }));

  const setAllOpen = (value) =>
    setOpen(
      Object.fromEntries(sections.map((section) => [section.uid, value])),
    );

  const discardChanges = () => {
    if (dirty && !window.confirm("Discard all unsaved changes?")) return;

    loadPolicy();
  };

  // ---------------------------------------------------------
  // SAVE  (PUT /api/privacy-policy)
  // ---------------------------------------------------------

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (sections.length === 0) {
      setError("Add at least one section before saving.");
      return;
    }

    const missingTitleIndex = sections.findIndex(
      (section) => !section.title.trim(),
    );

    if (missingTitleIndex !== -1) {
      setError(`Section ${missingTitleIndex + 1} needs a title.`);
      setOpen((previous) => ({
        ...previous,
        [sections[missingTitleIndex].uid]: true,
      }));
      return;
    }

    setSaving(true);

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/privacy-policy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sections: stripPolicyIds(sections) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save the privacy policy.");
      }

      // Use what the server saved (empty blocks are removed).
      setSections(withPolicyIds(data.policy.sections));
      setLastUpdated(data.policy.lastUpdated);
      setUsingDefault(false);
      setOpen({});
      setDirty(false);
      setSuccess(data.message || "Privacy policy saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save the privacy policy.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // RESET TO DEFAULT  (DELETE /api/privacy-policy)
  // ---------------------------------------------------------

  const resetToDefault = async () => {
    if (
      !window.confirm(
        "Delete your saved version and go back to the original default text? The website will change immediately.",
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = getAdminToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/privacy-policy`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset the privacy policy.");
      }

      await loadPolicy();
      setSuccess(data.message || "Privacy policy reset to the default text.");
    } catch (err) {
      setError(err.message || "Unable to reset the privacy policy.");
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="space-y-6 pb-4">
      {error && <Feedback type="error" message={error} />}
      {success && <Feedback type="success" message={success} />}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-500 shadow-sm">
          <LoaderCircle size={22} className="animate-spin text-[#338DFD]" />
          Loading privacy policy...
        </div>
      ) : (
        <>
          {/* STATUS AND TOOLS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#338DFD]">
                <ShieldCheck size={25} />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black text-[#102B4E]">
                  Privacy Policy
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {usingDefault ? (
                    <>
                      <span className="font-extrabold text-[#102B4E]">
                        Showing the default text.
                      </span>{" "}
                      You have not saved your own version yet.
                    </>
                  ) : (
                    <>
                      <span className="font-extrabold text-[#102B4E]">
                        Last published:
                      </span>{" "}
                      {lastUpdated
                        ? new Date(lastUpdated).toLocaleString()
                        : "Not available"}
                    </>
                  )}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Changes go live as soon as you save. Section numbers, the
                  &ldquo;Last updated&rdquo; date and the &ldquo;Contact
                  Us&rdquo; section (taken from the General tab) are added
                  automatically.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-[#102B4E] transition hover:border-[#338DFD]/40 hover:bg-blue-50"
              >
                <ExternalLink size={15} />
                View public page
              </a>

              <PolicyToolbarButton onClick={() => setAllOpen(true)}>
                Expand all
              </PolicyToolbarButton>

              <PolicyToolbarButton onClick={() => setAllOpen(false)}>
                Collapse all
              </PolicyToolbarButton>

              {!usingDefault && (
                <PolicyToolbarButton onClick={resetToDefault}>
                  <RotateCcw size={15} />
                  Reset to default
                </PolicyToolbarButton>
              )}
            </div>
          </div>

          {/* SECTIONS */}
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => {
              const isOpen = Boolean(open[section.uid]);

              return (
                <div
                  key={section.uid}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Section header */}
                  <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.uid)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-[#246FC9]">
                        {sectionIndex + 1}
                      </span>

                      <span className="min-w-0 break-words text-base font-extrabold text-[#102B4E] sm:text-lg">
                        {section.title.trim() || "Untitled section"}
                      </span>

                      {isOpen ? (
                        <ChevronUp
                          size={18}
                          className="shrink-0 text-slate-400"
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-slate-400"
                        />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <PolicyIconButton
                        label="Move section up"
                        disabled={sectionIndex === 0}
                        onClick={() => moveSection(sectionIndex, -1)}
                      >
                        <ArrowUp size={16} />
                      </PolicyIconButton>

                      <PolicyIconButton
                        label="Move section down"
                        disabled={sectionIndex === sections.length - 1}
                        onClick={() => moveSection(sectionIndex, 1)}
                      >
                        <ArrowDown size={16} />
                      </PolicyIconButton>

                      <PolicyIconButton
                        label="Delete section"
                        danger
                        onClick={() => deleteSection(sectionIndex)}
                      >
                        <Trash2 size={16} />
                      </PolicyIconButton>
                    </div>
                  </div>

                  {/* Section body */}
                  {isOpen && (
                    <div className="space-y-5 border-t border-slate-100 p-4 sm:p-6">
                      <div>
                        <label
                          htmlFor={`policy-title-${section.uid}`}
                          className="mb-2 block text-sm font-extrabold text-[#102B4E]"
                        >
                          Section title
                        </label>

                        <input
                          id={`policy-title-${section.uid}`}
                          type="text"
                          value={section.title}
                          maxLength={200}
                          placeholder="e.g. How We Use Your Information"
                          onChange={(event) =>
                            updateSection(sectionIndex, {
                              title: event.target.value,
                            })
                          }
                          className={POLICY_INPUT_CLASS}
                        />
                      </div>

                      {section.blocks.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                          This section has no content yet. Use the buttons below
                          to add a paragraph, subheading or bullet list.
                        </p>
                      )}

                      {section.blocks.map((block, blockIndex) => (
                        <PolicyBlockEditor
                          key={block.uid}
                          block={block}
                          isFirst={blockIndex === 0}
                          isLast={blockIndex === section.blocks.length - 1}
                          onChange={(patch) =>
                            updateBlock(sectionIndex, blockIndex, patch)
                          }
                          onMove={(direction) =>
                            moveBlock(sectionIndex, blockIndex, direction)
                          }
                          onDelete={() => deleteBlock(sectionIndex, blockIndex)}
                          onBulletChange={(itemIndex, value) =>
                            updateBullet(
                              sectionIndex,
                              blockIndex,
                              itemIndex,
                              value,
                            )
                          }
                          onBulletAdd={() =>
                            addBullet(sectionIndex, blockIndex)
                          }
                          onBulletDelete={(itemIndex) =>
                            deleteBullet(sectionIndex, blockIndex, itemIndex)
                          }
                        />
                      ))}

                      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <PolicyToolbarButton
                          onClick={() => addBlock(sectionIndex, "paragraph")}
                        >
                          <Type size={15} />
                          Add paragraph
                        </PolicyToolbarButton>

                        <PolicyToolbarButton
                          onClick={() => addBlock(sectionIndex, "subheading")}
                        >
                          <Heading size={15} />
                          Add subheading
                        </PolicyToolbarButton>

                        <PolicyToolbarButton
                          onClick={() => addBlock(sectionIndex, "bullets")}
                        >
                          <List size={15} />
                          Add bullet list
                        </PolicyToolbarButton>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addSection}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-extrabold text-[#246FC9] transition hover:border-[#338DFD] hover:bg-blue-50"
            >
              <Plus size={18} />
              Add new section
            </button>
          </div>

          {/* SAVE BAR */}
          <div className="sticky bottom-4 z-20">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {dirty ? (
                  <span className="text-amber-700">
                    You have unsaved changes.
                  </span>
                ) : (
                  "All changes are saved."
                )}
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={discardChanges}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#102B4E] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw size={16} />
                  Discard changes
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B4E] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#1B416F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}
                  {saving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// One block inside a section: paragraph, subheading or bullet list
function PolicyBlockEditor({
  block,
  isFirst,
  isLast,
  onChange,
  onMove,
  onDelete,
  onBulletChange,
  onBulletAdd,
  onBulletDelete,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#246FC9] ring-1 ring-slate-200">
          {POLICY_BLOCK_LABELS[block.kind]}
        </span>

        <div className="flex items-center gap-1">
          <PolicyIconButton
            label="Move up"
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={15} />
          </PolicyIconButton>

          <PolicyIconButton
            label="Move down"
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={15} />
          </PolicyIconButton>

          <PolicyIconButton label="Delete block" danger onClick={onDelete}>
            <Trash2 size={15} />
          </PolicyIconButton>
        </div>
      </div>

      {block.kind === "paragraph" && (
        <textarea
          value={block.text}
          rows={4}
          maxLength={5000}
          placeholder="Write the paragraph here..."
          onChange={(event) => onChange({ text: event.target.value })}
          className={`${POLICY_INPUT_CLASS} resize-y`}
        />
      )}

      {block.kind === "subheading" && (
        <input
          type="text"
          value={block.text}
          maxLength={200}
          placeholder="e.g. Students"
          onChange={(event) => onChange({ text: event.target.value })}
          className={POLICY_INPUT_CLASS}
        />
      )}

      {block.kind === "bullets" && (
        <div className="space-y-2">
          {block.items.map((item, itemIndex) => (
            <div key={item.uid} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-4 h-2 w-2 shrink-0 rounded-full bg-[#84e245]"
              />

              <textarea
                value={item.value}
                rows={2}
                maxLength={1000}
                placeholder="Bullet text..."
                aria-label={`Bullet ${itemIndex + 1}`}
                onChange={(event) =>
                  onBulletChange(itemIndex, event.target.value)
                }
                className={`${POLICY_INPUT_CLASS} min-w-0 flex-1 resize-y`}
              />

              <PolicyIconButton
                label="Delete bullet"
                danger
                onClick={() => onBulletDelete(itemIndex)}
              >
                <Trash2 size={15} />
              </PolicyIconButton>
            </div>
          ))}

          <button
            type="button"
            onClick={onBulletAdd}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-[#246FC9] transition hover:bg-blue-50"
          >
            <Plus size={15} />
            Add bullet
          </button>
        </div>
      )}
    </div>
  );
}

function PolicyIconButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-500 hover:bg-slate-100 hover:text-[#102B4E]"
      }`}
    >
      {children}
    </button>
  );
}

function PolicyToolbarButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-[#102B4E] transition hover:border-[#338DFD]/40 hover:bg-blue-50"
    >
      {children}
    </button>
  );
}

export default AdminSettings;
