import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

function StudentChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("studentToken");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/student/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      const studentData = JSON.parse(
        localStorage.getItem("studentData") || "{}",
      );

      localStorage.setItem(
        "studentData",
        JSON.stringify({
          ...studentData,
          mustChangePassword: false,
        }),
      );

      setSuccess("Password changed successfully.");

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 900);
    } catch (error) {
      console.error("Password change error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------
     PASSWORD RULES
  -------------------------------------------------- */

  const passwordRules = {
    length: formData.newPassword.length >= 8,
    hasNumber: /\d/.test(formData.newPassword),
    hasLetter: /[A-Za-z]/.test(formData.newPassword),
  };

  const passwordStrength = Object.values(passwordRules).filter(Boolean).length;

  const passwordMatch =
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  return (
    <div className="relative min-h-screen overflow-hidden bg-jashna-ivory px-5 py-8 sm:px-8 lg:px-12">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-jashna-maroon/5 blur-3xl" />

        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-jashna-gold/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1350px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-jashna-stone/60 bg-white/80 shadow-[0_30px_100px_rgba(20,30,60,0.10)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          {/* =================================================
              LEFT SECURITY PANEL
          ================================================= */}

          <div className="relative hidden min-h-[720px] overflow-hidden bg-[#102b4e] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            {/* Decorative glow */}
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-jashna-gold/10 blur-3xl" />

            {/* Orbital rings */}
            <div className="pointer-events-none absolute right-[-120px] top-[18%] h-[430px] w-[430px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[-70px] top-[24%] h-[330px] w-[330px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[-20px] top-[30%] h-[230px] w-[230px] rounded-full border border-white/10" />

            {/* Brand */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md">
                  <GraduationCap size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-[0.18em] uppercase">
                    Jashna Edu
                  </p>

                  <p className="mt-0.5 text-xs text-white/50">
                    Student Learning Space
                  </p>
                </div>
              </div>
            </div>

            {/* Main visual */}
            <div className="relative z-10 max-w-xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-md">
                <ShieldCheck size={14} />
                Secure your account
              </div>

              <h2 className="font-display text-5xl leading-[1.05] tracking-tight xl:text-6xl">
                Make it
                <br />
                <span className="text-blue-200">personal.</span>
                <br />
                Make it yours.
              </h2>

              <p className="mt-7 max-w-md text-base leading-7 text-white/65">
                Your temporary password was created to give you your first
                secure access. Now create a password that only you know.
              </p>

              {/* Security features */}
              <div className="mt-9 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <KeyRound size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Personal password</p>

                    <p className="text-xs text-white/45">
                      Only you should know it
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Protected account</p>

                    <p className="text-xs text-white/45">
                      Keep your credentials private
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="relative z-10 flex items-center gap-3 text-sm text-white/45">
              <Lock size={16} />

              <span>Secure student access</span>
            </div>
          </div>

          {/* =================================================
              RIGHT FORM PANEL
          ================================================= */}

          <div className="relative flex min-h-[720px] items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-[520px]">
              {/* Mobile brand */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102b4e] text-white shadow-lg">
                  <GraduationCap size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-[0.18em] uppercase text-[#102b4e]">
                    Jashna Edu
                  </p>

                  <p className="text-xs text-jashna-muted">
                    Student Learning Space
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#244b73]">
                  <Sparkles size={14} />
                  One-time setup
                </div>

                <h1 className="font-display text-4xl font-semibold tracking-tight text-[#162b44] sm:text-5xl">
                  Create your password.
                </h1>

                <p className="mt-4 max-w-md text-[15px] leading-6 text-jashna-muted">
                  For your security, replace the temporary password with your
                  own personal password before entering the portal.
                </p>
              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ---------------------------------------------
                    CURRENT PASSWORD
                ---------------------------------------------- */}

                <PasswordField
                  id="currentPassword"
                  name="currentPassword"
                  label="Temporary password"
                  placeholder="Enter your temporary password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  showPassword={showPasswords.currentPassword}
                  onToggle={() => togglePasswordVisibility("currentPassword")}
                  autoComplete="current-password"
                  icon={<Lock size={18} />}
                />

                {/* ---------------------------------------------
                    NEW PASSWORD
                ---------------------------------------------- */}

                <PasswordField
                  id="newPassword"
                  name="newPassword"
                  label="New password"
                  placeholder="Create a password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  showPassword={showPasswords.newPassword}
                  onToggle={() => togglePasswordVisibility("newPassword")}
                  autoComplete="new-password"
                  icon={<KeyRound size={18} />}
                />

                {/* Password strength */}
                {formData.newPassword.length > 0 && (
                  <div className="-mt-1 rounded-2xl border border-jashna-stone/70 bg-jashna-ivory/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#526579]">
                        Password requirements
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          passwordStrength === 3
                            ? "text-green-600"
                            : "text-[#75879a]"
                        }`}
                      >
                        {passwordStrength === 3
                          ? "Ready"
                          : `${passwordStrength}/3`}
                      </span>
                    </div>

                    {/* Strength bar */}
                    <div className="mb-4 flex gap-1.5">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= item
                              ? "bg-[#244b73]"
                              : "bg-[#dce3ea]"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <PasswordRule
                        valid={passwordRules.length}
                        text="8+ characters"
                      />

                      <PasswordRule
                        valid={passwordRules.hasLetter}
                        text="A letter"
                      />

                      <PasswordRule
                        valid={passwordRules.hasNumber}
                        text="A number"
                      />
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------
                    CONFIRM PASSWORD
                ---------------------------------------------- */}

                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm new password"
                  placeholder="Re-enter your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  showPassword={showPasswords.confirmPassword}
                  onToggle={() => togglePasswordVisibility("confirmPassword")}
                  autoComplete="new-password"
                  icon={<Lock size={18} />}
                />

                {/* Match status */}
                {formData.confirmPassword.length > 0 && (
                  <div
                    className={`-mt-2 flex items-center gap-2 text-xs font-semibold ${
                      passwordMatch ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {passwordMatch ? (
                      <>
                        <CheckCircle2 size={15} />
                        Passwords match.
                      </>
                    ) : (
                      <>
                        <X size={15} />
                        Passwords do not match.
                      </>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-700">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm leading-5 text-green-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                    <div>
                      <p className="font-bold">
                        Password updated successfully.
                      </p>

                      <p className="mt-0.5 text-green-600/80">
                        Taking you to your student dashboard...
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    relative
                    mt-2
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2.5
                    overflow-hidden
                    rounded-2xl
                    bg-[#173b62]
                    px-5
                    py-4
                    text-[15px]
                    font-bold
                    text-white
                    shadow-[0_12px_30px_rgba(23,59,98,0.20)]
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:bg-[#102f51]
                    hover:shadow-[0_18px_38px_rgba(23,59,98,0.28)]
                    active:translate-y-[1px]
                    active:scale-[0.985]
                    active:shadow-[0_7px_18px_rgba(23,59,98,0.18)]
                    disabled:cursor-not-allowed
                    disabled:translate-y-0
                    disabled:opacity-60
                  "
                >
                  {/* Shine */}
                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      -left-20
                      w-16
                      rotate-12
                      bg-white/15
                      blur-md
                      transition-all
                      duration-700
                      group-hover:left-[110%]
                    "
                  />

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Create My Password</span>

                      <ArrowRight
                        size={18}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Security note */}
              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-jashna-muted">
                <ShieldCheck size={15} />

                <span>Never share your password with anyone.</span>
              </div>

              {/* Footer */}
              <div className="mt-8 border-t border-jashna-stone/70 pt-6 text-center">
                <p className="text-xs leading-5 text-jashna-muted">
                  Jashna Edu
                  <span className="mx-2 text-jashna-stone">•</span>
                  Secure Student Access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  onToggle,
  autoComplete,
  icon,
}) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-2.5 block text-sm font-bold text-[#26384d]"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7890a8] transition-all duration-200 group-focus-within:scale-110 group-focus-within:text-[#244b73]">
          {icon}
        </span>

        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className="
            w-full
            rounded-2xl
            border
            border-jashna-stone
            bg-jashna-ivory/40
            py-4
            pl-12
            pr-12
            text-[15px]
            font-medium
            tracking-wide
            text-[#26384d]
            outline-none
            transition-all
            duration-200
            placeholder:text-[#9aa9b8]
            hover:-translate-y-0.5
            hover:border-[#9aafc2]
            hover:bg-white
            hover:shadow-[0_8px_25px_rgba(30,60,90,0.06)]
            focus:-translate-y-0.5
            focus:border-[#244b73]
            focus:bg-white
            focus:ring-4
            focus:ring-[#244b73]/10
            focus:shadow-[0_10px_30px_rgba(36,75,115,0.08)]
          "
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            showPassword
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="
            absolute
            right-3
            top-1/2
            flex
            h-9
            w-9
            -translate-y-1/2
            items-center
            justify-center
            rounded-xl
            text-[#7b8da0]
            transition-all
            duration-200
            hover:bg-[#edf2f7]
            hover:text-[#244b73]
            active:scale-90
          "
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PASSWORD RULE
========================================================= */

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
        valid ? "text-green-600" : "text-[#8b9aaa]"
      }`}
    >
      {valid ? (
        <Check size={13} strokeWidth={2.5} />
      ) : (
        <span className="h-3 w-3 rounded-full border border-current" />
      )}

      <span>{text}</span>
    </div>
  );
}

export default StudentChangePassword;
