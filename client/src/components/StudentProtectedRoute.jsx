import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { Navigate, Outlet } from "react-router-dom";

function StudentProtectedRoute() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("studentToken");

      if (!token) {
        setAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/student/verify`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Student authentication failed");
        }

        const data = await response.json();

        setAuthenticated(true);

        setMustChangePassword(
          Boolean(data.student?.mustChangePassword)
        );

        localStorage.setItem(
          "studentData",
          JSON.stringify(data.student)
        );
      } catch (error) {
        console.error(
          "Student authentication failed:",
          error
        );

        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");

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
            Verifying student access...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/student/login" replace />;
  }

  if (mustChangePassword) {
    return (
      <Navigate
        to="/student/change-password"
        replace
      />
    );
  }

  return <Outlet />;
}

export default StudentProtectedRoute;