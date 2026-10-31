import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentProtectedRoute from "./components/StudentProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

/* Home sections (static, so the homepage shows fast) */
import Hero from "./sections/Hero";
import TrustProof from "./sections/TrustProof";
import JashnaMethod from "./sections/JashnaMethod";
import JashnaGrowth from "./sections/JashnaGrowth";
import WeeklyChallenge from "./sections/WeeklyChallenge";
import FAQSection from "./sections/FAQSection";

/* Layouts + AI widget (lazy) */
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const StudentPortal = lazy(() => import("./components/StudentPortal"));
const JashnaAiWidget = lazy(() => import("./components/JashnaAiWidget"));

/* Public pages (lazy) */
const About = lazy(() => import("./pages/About"));
const Events = lazy(() => import("./pages/Events"));
const Programs = lazy(() => import("./pages/Programs"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Resources = lazy(() => import("./pages/Resources"));
const IELTS = lazy(() => import("./pages/IELTS"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const WeeklyResult = lazy(() => import("./pages/WeeklyResult"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

/* Admin pages (lazy) */
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const EventForm = lazy(() => import("./pages/EventForm"));
const AdminAttendance = lazy(() => import("./pages/AdminAttendance"));
const AdminActivities = lazy(() => import("./pages/AdminActivities"));
const AdminChallenges = lazy(() => import("./pages/AdminChallenges"));
const ChallengeForm = lazy(() => import("./pages/ChallengeForm"));
const ChallengeSettings = lazy(() => import("./pages/ChallengeSettings"));
const AdminStudents = lazy(() => import("./pages/AdminStudents"));
const AdminTaskLibrary = lazy(() => import("./pages/AdminTaskLibrary"));
const AdminSubmissions = lazy(() => import("./pages/AdminSubmissions"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminPrograms = lazy(() => import("./pages/AdminPrograms"));
const AdminRecentAdmissions = lazy(
  () => import("./pages/AdminRecentAdmissions"),
);
const AdminLearningGoals = lazy(() => import("./pages/AdminLearningGoals"));
const AdminCareers = lazy(() => import("./pages/AdminCareers"));
const AdminFAQs = lazy(() => import("./pages/AdminFAQs"));
const AdminAssessmentLinks = lazy(() => import("./pages/AdminAssessmentLinks"));
const AdminBatchTransfers = lazy(() => import("./pages/AdminBatchTransfers"));

/* Student pages (lazy) */
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const StudentChangePassword = lazy(
  () => import("./pages/StudentChangePassword"),
);
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentAttendance = lazy(() => import("./pages/StudentAttendance"));
const StudentMonthlyActivities = lazy(
  () => import("./pages/StudentMonthlyActivities"),
);
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const StudentTasks = lazy(() => import("./pages/StudentTasks"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
      Loading...
    </div>
  );
}

/* AI widget mounts 3 seconds after load */
function DeferredAiWidget() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <JashnaAiWidget />
    </Suspense>
  );
}

function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-jashna-ivory text-jashna-charcoal">
      <main>
        <Hero />
        <JashnaMethod />
        <TrustProof />
        <JashnaGrowth />
        <FAQSection />
        <WeeklyChallenge />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-28 text-center">
      <p className="text-xs font-bold tracking-[0.24em] text-jashna-gold">
        404
      </p>

      <h1 className="mt-3 font-serif text-3xl text-jashna-navy sm:text-5xl">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-sm text-jashna-charcoal/70 sm:text-base">
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-7 inline-flex items-center rounded-full bg-jashna-navy px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}

/* Shared layout for every public page.
   Navbar, Footer and the AI widget stay mounted while you move between
   public pages, and they do not appear on admin / student / login pages. */
function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-jashna-ivory">
      <Navbar />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
      <DeferredAiWidget />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Scrolls to the top on every page change */}
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC (Navbar + Footer + AI widget) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/ielts" element={<IELTS />} />
            <Route path="/weekly-challenge" element={<WeeklyChallenge />} />
            <Route path="/weekly-analysis" element={<WeeklyResult />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* LOGINS */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/change-password"
            element={<StudentChangePassword />}
          />

          {/* ADMIN */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/events/new" element={<EventForm />} />
              <Route path="/admin/events/edit/:id" element={<EventForm />} />
              <Route path="/admin/challenges" element={<AdminChallenges />} />
              <Route path="/admin/challenges/new" element={<ChallengeForm />} />
              <Route
                path="/admin/challenges/edit/:id"
                element={<ChallengeForm />}
              />
              <Route
                path="/admin/challenges/settings"
                element={<ChallengeSettings />}
              />
              <Route path="/admin/programs" element={<AdminPrograms />} />
              <Route
                path="/admin/recent-admissions"
                element={<AdminRecentAdmissions />}
              />
              <Route
                path="/admin/batch-transfers"
                element={<AdminBatchTransfers />}
              />
              <Route path="/admin/faqs" element={<AdminFAQs />} />
              <Route
                path="/admin/assessment-links"
                element={<AdminAssessmentLinks />}
              />
              <Route
                path="/admin/learning-goals"
                element={<AdminLearningGoals />}
              />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route
                path="/admin/assessments-tasks"
                element={<AdminTaskLibrary />}
              />
              <Route path="/admin/submissions" element={<AdminSubmissions />} />
              <Route path="/admin/careers" element={<AdminCareers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

            </Route>
          </Route>

          {/* STUDENT */}
          <Route element={<StudentProtectedRoute />}>
            <Route element={<StudentPortal />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route
                path="/student/attendance"
                element={<StudentAttendance />}
              />
              <Route
                path="/student/activities"
                element={<StudentMonthlyActivities />}
              />
              <Route path="/student/tasks" element={<StudentTasks />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
