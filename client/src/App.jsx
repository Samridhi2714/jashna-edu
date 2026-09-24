import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Hero from "./sections/Hero";
import TrustProof from "./sections/TrustProof";
import JashnaMethod from "./sections/JashnaMethod";
import JashnaGrowth from "./sections/JashnaGrowth";
import WeeklyChallenge from "./sections/WeeklyChallenge";

import About from "./pages/About";
import Events from "./pages/Events";
import Programs from "./pages/Programs";
import Assessment from "./pages/Assessment";
import Testimonials from "./pages/Testimonials";
import Resources from "./pages/Resources";

import AdminLogin from "./pages/AdminLogin";
import AdminEvents from "./pages/AdminEvents";
import EventForm from "./pages/EventForm";

import AdminChallenges from "./pages/AdminChallenges";
import ChallengeForm from "./pages/ChallengeForm";
import ChallengeSettings from "./pages/ChallengeSettings";

import WeeklyResult from "./pages/WeeklyResult";

/* =========================================================
   HOME
========================================================= */

function HomePage() {
  return (
    <div
      id="top"
      className="min-h-screen bg-jashna-ivory text-jashna-charcoal"
    >
      <main>
        <Hero />
        <JashnaMethod />
        <TrustProof />
        <JashnaGrowth />
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

            {/* =================================================
                RESOURCES / KNOWLEDGE HUB
            ================================================= */}

            <Route
              path="/resources"
              element={
                <>
                  <Navbar />
                  <Resources />
                </>
              }
            />

            {/* =================================================
                WEEKLY CHALLENGE
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

            {/* =================================================
                WEEKLY ANALYSIS
            ================================================= */}

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
                ADMIN LOGIN
            ================================================= */}

            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* =================================================
                PROTECTED ADMIN
            ================================================= */}

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>

                <Route
                  path="/admin/events"
                  element={<AdminEvents />}
                />

                <Route
                  path="/admin/events/new"
                  element={<EventForm />}
                />

                <Route
                  path="/admin/events/edit/:id"
                  element={<EventForm />}
                />

                <Route
                  path="/admin/challenges"
                  element={<AdminChallenges />}
                />

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

              </Route>
            </Route>

          </Routes>

        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;