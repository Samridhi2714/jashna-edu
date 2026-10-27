import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store authentication details
      localStorage.setItem("adminToken", data.token);

      localStorage.setItem("adminData", JSON.stringify(data.admin));

      // Go to admin area
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-jashna-ivory px-5 py-8 sm:px-8 lg:px-12">
      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-jashna-maroon/5 blur-3xl" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-jashna-gold/10 blur-3xl" />

        {/* Subtle grid */}
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
          MAIN
      ================================================= */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1350px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-jashna-stone/60 bg-white/80 shadow-[0_30px_100px_rgba(20,30,60,0.10)] backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
          {/* =================================================
              LEFT ADMIN PANEL
          ================================================= */}

          <div className="relative hidden min-h-[680px] overflow-hidden bg-[#102b4e] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            {/* Background glows */}
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-jashna-gold/10 blur-3xl" />

            {/* Decorative rings */}
            <div className="pointer-events-none absolute right-[-120px] top-[18%] h-[430px] w-[430px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[-70px] top-[24%] h-[330px] w-[330px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute right-[-20px] top-[30%] h-[230px] w-[230px] rounded-full border border-white/10" />

            {/* Brand */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md">
                  <UserCog size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-[0.18em] uppercase">
                    Jashna Edu
                  </p>

                  <p className="mt-0.5 text-xs text-white/50">
                    Administration Workspace
                  </p>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-md">
                <Sparkles size={14} />
                Administrative Access
              </div>

              <h2 className="font-display text-5xl leading-[1.05] tracking-tight xl:text-6xl">
                Shape the
                <br />
                <span className="text-blue-200">learning</span>
                <br />
                experience.
              </h2>

              <p className="mt-7 max-w-md text-base leading-7 text-white/65">
                Manage students, attendance, activities and website content from
                your Jashna Edu administration workspace.
              </p>

              {/* Admin feature cards */}
              <div className="mt-9 grid grid-cols-2 gap-3">
                <AdminFeature
                  icon={<UserCog size={17} />}
                  title="Students"
                  text="Manage accounts"
                />

                <AdminFeature
                  icon={<ShieldCheck size={17} />}
                  title="Attendance"
                  text="Track records"
                />

                <AdminFeature
                  icon={<KeyRound size={17} />}
                  title="Access"
                  text="Secure controls"
                />

                <AdminFeature
                  icon={<Sparkles size={17} />}
                  title="Content"
                  text="Manage website"
                />
              </div>
            </div>

            {/* Bottom */}
            <div className="relative z-10 flex items-center gap-3 text-sm text-white/45">
              <ShieldCheck size={16} />

              <span>Protected administrative access</span>
            </div>
          </div>

          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================= */}

          <div className="relative flex min-h-[680px] items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-[500px]">
              {/* Mobile brand */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102b4e] text-white shadow-lg">
                  <UserCog size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-[0.18em] uppercase text-[#102b4e]">
                    Jashna Edu
                  </p>

                  <p className="text-xs text-jashna-muted">
                    Administration Workspace
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-9">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#244b73]">
                  <ShieldCheck size={14} />
                  Admin Portal
                </div>

                <h1 className="font-display text-4xl font-semibold tracking-tight text-[#162b44] sm:text-5xl">
                  Welcome back.
                </h1>

                <p className="mt-4 max-w-md text-[15px] leading-6 text-jashna-muted">
                  Sign in to manage the Jashna Edu platform and student learning
                  experience.
                </p>
              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-sm font-bold text-[#26384d]"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      strokeWidth={2}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#7890a8]
                        transition-all
                        duration-200
                        group-focus-within:scale-110
                        group-focus-within:text-[#244b73]
                      "
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter admin email"
                      required
                      autoComplete="email"
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-jashna-stone
                        bg-jashna-ivory/40
                        py-4
                        pl-12
                        pr-4
                        text-[15px]
                        font-medium
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
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="mb-2.5 block text-sm font-bold text-[#26384d]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      strokeWidth={2}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#7890a8]
                        transition-all
                        duration-200
                        group-focus-within:scale-110
                        group-focus-within:text-[#244b73]
                      "
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
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

                    {/* Show password */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
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

                {/* Security hint */}
                <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs font-medium text-[#526b84]">
                  <ShieldCheck size={16} className="shrink-0 text-[#244b73]" />

                  <span>
                    This area is restricted to authorized Jashna Edu
                    administrators.
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-700">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    relative
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
                  {/* Button shine */}
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

                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Admin Portal</span>

                      <ArrowRight
                        size={18}
                        className="
                          transition-transform
                          duration-200
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Security footer */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-jashna-muted">
                <Lock size={14} />

                <span>Secure administrative access</span>
              </div>

              {/* Footer */}
              <div className="mt-8 border-t border-jashna-stone/70 pt-6 text-center">
                <p className="text-xs leading-5 text-jashna-muted">
                  Jashna Edu
                  <span className="mx-2 text-jashna-stone">•</span>
                  Administrative Access
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
   ADMIN FEATURE
========================================================= */

function AdminFeature({ icon, title, text }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/10
        bg-white/5
        px-3.5
        py-3
        backdrop-blur-md
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:bg-white/10
      "
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>

        <p className="truncate text-xs text-white/45">{text}</p>
      </div>
    </div>
  );
}

export default AdminLogin;
