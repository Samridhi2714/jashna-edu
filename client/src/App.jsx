import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentProtectedRoute from "./components/StudentProtectedRoute";

/* Home sections (static, taaki homepage fast dikhe) */
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
const AdminRecentAdmissions = lazy(() => import("./pages/AdminRecentAdmissions"));
const AdminLearningGoals = lazy(() => import("./pages/AdminLearningGoals"));
const AdminCareers = lazy(() => import("./pages/AdminCareers"));
const AdminFAQs = lazy(() => import("./pages/AdminFAQs"));
const AdminAssessmentLinks = lazy(() => import("./pages/AdminAssessmentLinks"));

/* Student pages (lazy) */
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const StudentChangePassword = lazy(() => import("./pages/StudentChangePassword"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentAttendance = lazy(() => import("./pages/StudentAttendance"));
const StudentMonthlyActivities = lazy(() => import("./pages/StudentMonthlyActivities"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const StudentTasks = lazy(() => import("./pages/StudentTasks"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
      Loading...
    </div>
  );
}

/* AI widget 3 second baad mount hoga */
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

/* Navbar + page ek saath, repetition kam karne ke liye */
const withNavbar = (Page) => (
  <>
    <Navbar />
    <Page />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-jashna-ivory">
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* PUBLIC */}
              <Route path="/" element={withNavbar(HomePage)} />
              <Route path="/about" element={withNavbar(About)} />
              <Route path="/events" element={withNavbar(Events)} />
              <Route path="/programs" element={withNavbar(Programs)} />
              <Route path="/assessment" element={withNavbar(Assessment)} />
              <Route path="/resources" element={withNavbar(Resources)} />
              <Route path="/ielts" element={withNavbar(IELTS)} />
              <Route path="/weekly-challenge" element={withNavbar(WeeklyChallenge)} />
              <Route path="/weekly-analysis" element={withNavbar(WeeklyResult)} />
              <Route path="/testimonials" element={withNavbar(Testimonials)} />
              <Route path="/careers" element={withNavbar(CareersPage)} />

              {/* LOGINS */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/change-password" element={<StudentChangePassword />} />

              {/* ADMIN */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/events" element={<AdminEvents />} />
                  <Route path="/admin/events/new" element={<EventForm />} />
                  <Route path="/admin/events/edit/:id" element={<EventForm />} />
                  <Route path="/admin/challenges" element={<AdminChallenges />} />
                  <Route path="/admin/challenges/new" element={<ChallengeForm />} />
                  <Route path="/admin/challenges/edit/:id" element={<ChallengeForm />} />
                  <Route path="/admin/challenges/settings" element={<ChallengeSettings />} />
                  <Route path="/admin/programs" element={<AdminPrograms />} />
                  <Route path="/admin/recent-admissions" element={<AdminRecentAdmissions />} />
                  <Route path="/admin/faqs" element={<AdminFAQs />} />
                  <Route path="/admin/assessment-links" element={<AdminAssessmentLinks />} />
                  <Route path="/admin/learning-goals" element={<AdminLearningGoals />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/attendance" element={<AdminAttendance />} />
                  <Route path="/admin/activities" element={<AdminActivities />} />
                  <Route path="/admin/assessments-tasks" element={<AdminTaskLibrary />} />
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
                  <Route path="/student/attendance" element={<StudentAttendance />} />
                  <Route path="/student/activities" element={<StudentMonthlyActivities />} />
                  <Route path="/student/tasks" element={<StudentTasks />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </main>

        <Footer />
        <DeferredAiWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;