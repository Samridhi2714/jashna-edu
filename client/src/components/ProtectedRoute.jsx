import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/verify",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Admin authentication failed:", error);

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyToken();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-jashna-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-jashna-maroon/20 border-t-jashna-maroon rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-jashna-muted">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;