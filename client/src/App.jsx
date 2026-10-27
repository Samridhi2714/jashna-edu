import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentProtectedRoute from "./components/StudentProtectedRoute";
import StudentPortal from "./components/StudentPortal";
import JashnaAiWidget from "./components/JashnaAiWidget";

import Hero from "./sections/Hero";
import TrustProof from "./sections/TrustProof";
import JashnaMethod from "./sections/JashnaMethod";
import JashnaGrowth from "./sections/JashnaGrowth";
import WeeklyChallenge from "./sections/WeeklyChallenge";
import FAQSection from "./sections/FAQSection";

import About from "./pages/About";
import Events from "./pages/Events";
import Programs from "./pages/Programs";
import Assessment from "./pages/Assessment";
import Testimonials from "./pages/Testimonials";
import Resources from "./pages/Resources";
import IELTS from "./pages/IELTS";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminEvents from "./pages/AdminEvents";
import EventForm from "./pages/EventForm";
import AdminAttendance from "./pages/AdminAttendance";
import AdminActivities from "./pages/AdminActivities";
import AdminChallenges from "./pages/AdminChallenges";
import ChallengeForm from "./pages/ChallengeForm";
import ChallengeSettings from "./pages/ChallengeSettings";
import AdminStudents from "./pages/AdminStudents";
import AdminTaskLibrary from "./pages/AdminTaskLibrary";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminSettings from "./pages/AdminSettings";
import AdminPrograms from "./pages/AdminPrograms";
import AdminRecentAdmissions from "./pages/AdminRecentAdmissions";
import AdminLearningGoals from "./pages/AdminLearningGoals";
import AdminCareers from "./pages/AdminCareers";
import AdminFAQs from "./pages/AdminFAQs";
import AdminAssessmentLinks from "./pages/AdminAssessmentLinks";
import CareersPage from "./pages/CareersPage";

import StudentLogin from "./pages/StudentLogin";
import StudentChangePassword from "./pages/StudentChangePassword";
import StudentDashboard from "./pages/StudentDashboard";
import StudentAttendance from "./pages/StudentAttendance";
import StudentMonthlyActivities from "./pages/StudentMonthlyActivities";
import StudentProfile from "./pages/StudentProfile";
import StudentTasks from "./pages/StudentTasks";

import WeeklyResult from "./pages/WeeklyResult";

/* =========================================================
   HOME
========================================================= */

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

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-jashna-ivory">
        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="flex-1">
          <Routes>
            {/* =================================================
                PUBLIC WEBSITE
            ================================================= */}

            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <HomePage />
                </>
              }
            />

            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <About />
                </>
              }
            />

            <Route
              path="/events"
              element={
                <>
                  <Navbar />
                  <Events />
                </>
              }
            />

            <Route
              path="/programs"
              element={
                <>
                  <Navbar />
                  <Programs />
                </>
              }
            />

            <Route
              path="/assessment"
              element={
                <>
                  <Navbar />
                  <Assessment />
                </>
              }
            />

            <Route
              path="/resources"
              element={
                <>
                  <Navbar />
                  <Resources />
                </>
              }
            />

            <Route
              path="/ielts"
              element={
                <>
                  <Navbar />
                  <IELTS />
                </>
              }
            />

            {/* =================================================
                WEEKLY CHALLENGE

                This is a separate public challenge feature.
                It is NOT the student monthly activity system.
            ================================================= */}

            <Route
              path="/weekly-challenge"
              element={
                <>
                  <Navbar />
                  <WeeklyChallenge />
                </>
              }
            />

            <Route
              path="/weekly-analysis"
              element={
                <>
                  <Navbar />
                  <WeeklyResult />
                </>
              }
            />

            {/* =================================================
                TESTIMONIALS
            ================================================= */}

            <Route
              path="/testimonials"
              element={
                <>
                  <Navbar />
                  <Testimonials />
                </>
              }
            />
            {/* =================================================
                CAREERS (public)
            ================================================= */}

            <Route
              path="/careers"
              element={
                <>
                  <Navbar />
                  <CareersPage />
                </>
              }
            />
            {/* =================================================
                ADMIN LOGIN
            ================================================= */}

            <Route path="/admin/login" element={<AdminLogin />} />

            {/* =================================================
                STUDENT LOGIN
            ================================================= */}

            <Route path="/student/login" element={<StudentLogin />} />

            {/* =================================================
                STUDENT PASSWORD CHANGE
            ================================================= */}

            <Route
              path="/student/change-password"
              element={<StudentChangePassword />}
            />

            {/* =================================================
                PROTECTED ADMIN PORTAL
            ================================================= */}

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                {/* ===============================
                    DASHBOARD
                   =============================== */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                {/* ===============================
                    EVENTS
                =============================== */}

                <Route path="/admin/events" element={<AdminEvents />} />

                <Route path="/admin/events/new" element={<EventForm />} />

                <Route path="/admin/events/edit/:id" element={<EventForm />} />

                {/* ===============================
                    CHALLENGES
                =============================== */}

                <Route path="/admin/challenges" element={<AdminChallenges />} />

                <Route
                  path="/admin/challenges/new"
                  element={<ChallengeForm />}
                />

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
                {/* ===============================
                    FAQ MANAGEMENT
                =============================== */}

                <Route path="/admin/faqs" element={<AdminFAQs />} />
                <Route
                  path="/admin/assessment-links"
                  element={<AdminAssessmentLinks />}
                />
                <Route
                  path="/admin/learning-goals"
                  element={<AdminLearningGoals />}
                />
                {/* ===============================
                    STUDENT MANAGEMENT
                =============================== */}

                <Route path="/admin/students" element={<AdminStudents />} />

                {/* ===============================
                    ATTENDANCE
                =============================== */}

                <Route path="/admin/attendance" element={<AdminAttendance />} />

                {/* ===============================
                    MONTHLY ACTIVITIES
                =============================== */}

                <Route path="/admin/activities" element={<AdminActivities />} />

                <Route
                  path="/admin/assessments-tasks"
                  element={<AdminTaskLibrary />}
                />
                <Route
                  path="/admin/submissions"
                  element={<AdminSubmissions />}
                />

                {/* ===============================
                    CAREERS (Other section)
                =============================== */}

                <Route path="/admin/careers" element={<AdminCareers />} />

                {/* ===============================
                    SETTINGS
                =============================== */}

                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* =================================================
                PROTECTED STUDENT PORTAL
            ================================================= */}

            <Route element={<StudentProtectedRoute />}>
              <Route element={<StudentPortal />}>
                {/* ===============================
                    STUDENT DASHBOARD
                =============================== */}

                <Route
                  path="/student/dashboard"
                  element={<StudentDashboard />}
                />

                {/* ===============================
                    STUDENT PROFILE
                =============================== */}

                <Route path="/student/profile" element={<StudentProfile />} />

                {/* ===============================
                    STUDENT ATTENDANCE
                =============================== */}

                <Route
                  path="/student/attendance"
                  element={<StudentAttendance />}
                />

                {/* ===============================
                    STUDENT MONTHLY ACTIVITIES
                =============================== */}

                <Route
                  path="/student/activities"
                  element={<StudentMonthlyActivities />}
                />

                {/* ===============================
                    STUDENT TASKS
                =============================== */}

                <Route path="/student/tasks" element={<StudentTasks />} />
              </Route>
            </Route>
          </Routes>
        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Footer />

        {/* =================================================
            JASHNA AI
        ================================================= */}

        <JashnaAiWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;
