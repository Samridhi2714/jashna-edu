import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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

      // Go to admin dashboard
      navigate("/admin/events");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jashna-ivory flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <p className="text-sm tracking-[0.3em] uppercase text-jashna-gold font-semibold mb-3">
            Jashna Edu
          </p>

          <h1 className="font-display text-4xl text-jashna-maroon-dark">
            Admin Portal
          </h1>

          <p className="mt-3 text-jashna-muted">
            Sign in to manage the Jashna Edu website.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl shadow-xl border border-jashna-stone/70 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-jashna-charcoal mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-jashna-muted"
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
                  className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 py-3.5 pl-12 pr-4 outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-jashna-charcoal mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-jashna-muted"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-jashna-stone bg-jashna-ivory/40 py-3.5 pl-12 pr-4 outline-none transition focus:border-jashna-maroon focus:ring-2 focus:ring-jashna-maroon/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-jashna-maroon px-5 py-3.5 font-semibold text-white transition hover:bg-jashna-maroon-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}

              {!loading && (
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-jashna-muted mt-8">
          Jashna Edu • Administrative Access
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
